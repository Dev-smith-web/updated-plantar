using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using PlantAR.Core;
using PlantAR.Data;
using PlantAR.UI;

namespace PlantAR.AR
{
    /// <summary>
    /// Spawns TrackedPlantRoot when reference image is detected.
    /// Enforces single active target for MVP.
    /// </summary>
    [RequireComponent(typeof(ARTrackedImageManager))]
    public class TrackedImageSpawner : MonoBehaviour
    {
        [Header("Prefabs")]
        [SerializeField] private GameObject trackedPlantRootPrefab;
        
        [Header("Dependencies")]
        [SerializeField] private ARTrackedImageManager trackedImageManager;
        
        private IContentProvider _contentProvider;
        private ARTrackedImage _activeImage;
        private GameObject _spawnedRoot;
        private TrackedPlantController _controller;
        
        // Map of referenceImage GUID → PlantData for quick lookup
        private Dictionary<string, PlantData> _guidToPlant;
        
        public event Action<PlantData> OnPlantSpawned;
        public event Action OnPlantDespawned;
        
        private void OnValidate()
        {
            if (trackedImageManager == null)
                trackedImageManager = GetComponent<ARTrackedImageManager>();
        }
        
        private void Awake()
        {
            // In production, inject via DI container (e.g., VContainer, Zenject)
            _contentProvider = ServiceLocator.Get<IContentProvider>();
            _guidToPlant = new Dictionary<string, PlantData>();
        }
        
        private async void Start()
        {
            // Build GUID → PlantData mapping
            var plants = await _contentProvider.GetAvailablePlantsAsync();
            foreach (var plant in plants)
            {
                if (!string.IsNullOrEmpty(plant.referenceImageGuid))
                    _guidToPlant[plant.referenceImageGuid] = plant;
            }
            
            Debug.Log($"[TrackedImageSpawner] Mapped {_guidToPlant.Count} reference images");
        }
        
        private void OnEnable()
        {
            trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
        }
        
        private void OnDisable()
        {
            trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
        }
        
        private async void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs args)
        {
            // Handle newly detected images
            foreach (var image in args.added)
            {
                // Enforce single target
                if (_activeImage != null)
                {
                    Toast.Show("Another target detected. Focusing on current plant.");
                    continue;
                }
                
                await SpawnForImage(image);
            }
            
            // Update tracking state
            foreach (var image in args.updated)
            {
                if (image == _activeImage && _controller != null)
                {
                    _controller.SetTrackingState(image.trackingState);
                }
            }
            
            // Handle lost images
            foreach (var image in args.removed)
            {
                if (image == _activeImage)
                {
                    DespawnCurrent();
                }
            }
        }
        
        private async System.Threading.Tasks.Task SpawnForImage(ARTrackedImage image)
        {
            var guid = image.referenceImage.guid.ToString();
            
            if (!_guidToPlant.TryGetValue(guid, out var plant))
            {
                Debug.LogWarning($"[TrackedImageSpawner] No plant mapped for GUID: {guid}");
                return;
            }
            
            _activeImage = image;
            
            // Spawn root container
            _spawnedRoot = Instantiate(trackedPlantRootPrefab, image.transform);
            _controller = _spawnedRoot.GetComponent<TrackedPlantController>();
            
            if (_controller == null)
            {
                Debug.LogError("[TrackedImageSpawner] TrackedPlantRoot prefab missing TrackedPlantController!");
                Destroy(_spawnedRoot);
                _activeImage = null;
                return;
            }
            
            // Load and inject model
            var modelPrefab = await _contentProvider.LoadModelPrefabAsync(plant);
            if (modelPrefab == null)
            {
                Debug.LogError($"[TrackedImageSpawner] Failed to load model for {plant.plantId}");
                Destroy(_spawnedRoot);
                _activeImage = null;
                return;
            }
            
            var modelInstance = Instantiate(modelPrefab, _controller.ModelMount);
            _controller.Initialize(plant, modelInstance);
            _controller.SetTrackingState(image.trackingState);
            
            OnPlantSpawned?.Invoke(plant);
            Debug.Log($"[TrackedImageSpawner] Spawned plant: {plant.displayName}");
        }
        
        private void DespawnCurrent()
        {
            if (_spawnedRoot != null)
            {
                Destroy(_spawnedRoot);
                _spawnedRoot = null;
            }
            
            _controller = null;
            _activeImage = null;
            OnPlantDespawned?.Invoke();
            
            Debug.Log("[TrackedImageSpawner] Despawned plant");
        }
        
        public TrackedPlantController GetActiveController() => _controller;
    }
}