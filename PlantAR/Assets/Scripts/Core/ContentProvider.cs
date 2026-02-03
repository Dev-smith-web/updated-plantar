using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;
using PlantAR.Data;

namespace PlantAR.Core
{
    /// <summary>
    /// Manages loading and caching of plant content via Addressables.
    /// Singleton service for content access throughout the app.
    /// </summary>
    public interface IContentProvider
    {
        Task<IReadOnlyList<PlantData>> GetAvailablePlantsAsync();
        Task<PlantData> GetPlantAsync(string plantId);
        Task<GameObject> LoadModelPrefabAsync(PlantData plant);
        PlantData CurrentPlant { get; set; }
        void ReleaseAll();
    }
    
    public class ContentProvider : IContentProvider
    {
        private readonly Dictionary<string, PlantData> _plantCache = new Dictionary<string, PlantData>();
        private readonly Dictionary<string, AsyncOperationHandle<GameObject>> _modelHandles = new Dictionary<string, AsyncOperationHandle<GameObject>>();
        private AsyncOperationHandle<IList<PlantData>> _plantsHandle;
        private bool _plantsLoaded;
        
        public PlantData CurrentPlant { get; set; }
        
        /// <summary>
        /// Load all plants tagged with "plant" label in Addressables.
        /// For MVP, this can be synchronous if catalog is embedded.
        /// </summary>
        public async Task<IReadOnlyList<PlantData>> GetAvailablePlantsAsync()
        {
            if (_plantsLoaded && _plantsHandle.IsValid())
            {
                return _plantsHandle.Result as IReadOnlyList<PlantData>;
            }
            
            _plantsHandle = Addressables.LoadAssetsAsync<PlantData>(
                "plant", 
                plant => _plantCache[plant.plantId] = plant
            );
            
            await _plantsHandle.Task;
            _plantsLoaded = true;
            
            Debug.Log($"[ContentProvider] Loaded {_plantsHandle.Result.Count} plants");
            return _plantsHandle.Result as IReadOnlyList<PlantData>;
        }
        
        /// <summary>
        /// Get specific plant by ID. Assumes GetAvailablePlantsAsync was called.
        /// </summary>
        public async Task<PlantData> GetPlantAsync(string plantId)
        {
            if (_plantCache.TryGetValue(plantId, out var cached))
                return cached;
            
            // Fallback: load individual asset
            var handle = Addressables.LoadAssetAsync<PlantData>(plantId);
            await handle.Task;
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                _plantCache[plantId] = handle.Result;
                return handle.Result;
            }
            
            Debug.LogError($"[ContentProvider] Failed to load plant: {plantId}");
            return null;
        }
        
        /// <summary>
        /// Load the 3D model prefab for a plant. Cached per plant.
        /// </summary>
        public async Task<GameObject> LoadModelPrefabAsync(PlantData plant)
        {
            if (plant == null)
            {
                Debug.LogError("[ContentProvider] Cannot load model for null plant");
                return null;
            }
            
            if (_modelHandles.TryGetValue(plant.plantId, out var cached) && cached.IsValid())
                return cached.Result;
            
            var handle = plant.modelPrefab.LoadAssetAsync<GameObject>();
            await handle.Task;
            
            if (handle.Status == AsyncOperationStatus.Succeeded)
            {
                _modelHandles[plant.plantId] = handle;
                Debug.Log($"[ContentProvider] Loaded model for {plant.plantId}");
                return handle.Result;
            }
            
            Debug.LogError($"[ContentProvider] Failed to load model for {plant.plantId}");
            return null;
        }
        
        /// <summary>
        /// Release all cached content. Call on scene exit.
        /// </summary>
        public void ReleaseAll()
        {
            foreach (var handle in _modelHandles.Values)
            {
                if (handle.IsValid())
                    Addressables.Release(handle);
            }
            
            _modelHandles.Clear();
            
            if (_plantsHandle.IsValid())
                Addressables.Release(_plantsHandle);
            
            _plantCache.Clear();
            _plantsLoaded = false;
            
            Debug.Log("[ContentProvider] Released all content");
        }
    }
}