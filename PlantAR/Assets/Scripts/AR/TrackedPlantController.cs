using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARSubsystems;
using PlantAR.Data;
using PlantAR.UI;

namespace PlantAR.AR
{
    /// <summary>
    /// Manages a single spawned plant instance: labels, selection, tracking state.
    /// Lives as child of ARTrackedImage transform.
    /// </summary>
    public class TrackedPlantController : MonoBehaviour
    {
        [Header("Mount Points")]
        [SerializeField] private Transform modelMount;
        [SerializeField] private Transform labelsRoot;
        
        [Header("Prefabs")]
        [SerializeField] private GameObject labelViewPrefab;
        
        [Header("Settings")]
        [SerializeField] private float trackingLostFadeDelay = 1.5f;
        [SerializeField] private LayerMask plantLayer;
        
        public Transform ModelMount => modelMount;
        
        private PlantData _plantData;
        private GameObject _modelInstance;
        private readonly List<LabelView> _labels = new List<LabelView>();
        private readonly Dictionary<string, PartInfo> _partInfos = new Dictionary<string, PartInfo>();
        
        private Camera _arCamera;
        private TrackingState _currentTrackingState = TrackingState.None;
        private float _trackingLostTime;
        private string _selectedPartId;
        
        public PlantData PlantData => _plantData;
        public bool LabelsVisible { get; private set; } = true;
        
        private struct PartInfo
        {
            public Transform anchor;
            public Transform mesh;
            public LabelView label;
        }
        
        private void Awake()
        {
            _arCamera = Camera.main;
        }
        
        /// <summary>
        /// Initialize with plant data and instantiated model.
        /// </summary>
        public void Initialize(PlantData plant, GameObject model)
        {
            _plantData = plant;
            _modelInstance = model;
            
            BuildPartMapping();
            CreateLabels();
            
            Debug.Log($"[TrackedPlantController] Initialized with {_labels.Count} labels");
        }
        
        private void BuildPartMapping()
        {
            foreach (var part in _plantData.parts)
            {
                var info = new PartInfo();
                
                // Find anchor transform
                if (!string.IsNullOrEmpty(part.attachNodePath))
                {
                    info.anchor = _modelInstance.transform.Find(part.attachNodePath);
                    if (info.anchor == null)
                        Debug.LogWarning($"[TrackedPlantController] Anchor not found: {part.attachNodePath}");
                }
                
                // Find mesh transform for hit-testing
                if (!string.IsNullOrEmpty(part.meshNodePath))
                {
                    info.mesh = _modelInstance.transform.Find(part.meshNodePath);
                    if (info.mesh == null)
                        Debug.LogWarning($"[TrackedPlantController] Mesh not found: {part.meshNodePath}");
                }
                
                _partInfos[part.partId] = info;
            }
        }
        
        private void CreateLabels()
        {
            foreach (var part in _plantData.parts)
            {
                if (!_partInfos.TryGetValue(part.partId, out var info) || info.anchor == null)
                    continue;
                
                var labelObj = Instantiate(labelViewPrefab, labelsRoot);
                var label = labelObj.GetComponent<LabelView>();
                
                if (label == null)
                {
                    Debug.LogError("[TrackedPlantController] LabelView prefab missing LabelView component!");
                    Destroy(labelObj);
                    continue;
                }
                
                label.Bind(part);
                label.SetAnchor(info.anchor);
                label.OnTapped += () => SelectPart(part.partId);
                
                _labels.Add(label);
                
                // Update struct in dict
                info.label = label;
                _partInfos[part.partId] = info;
            }
        }
        
        private void LateUpdate()
        {
            if (_arCamera == null) return;
            
            // Update all labels
            foreach (var label in _labels)
            {
                label.TickBillboard(_arCamera, plantLayer);
            }
            
            // Handle tracking lost fade
            if (_currentTrackingState == TrackingState.None)
            {
                _trackingLostTime += Time.deltaTime;
                if (_trackingLostTime > trackingLostFadeDelay)
                {
                    SetModelAlpha(0f);
                }
            }
        }
        
        public void SetTrackingState(TrackingState state)
        {
            _currentTrackingState = state;
            
            switch (state)
            {
                case TrackingState.Tracking:
                    _trackingLostTime = 0f;
                    SetModelAlpha(1f);
                    SetLabelsAlpha(1f);
                    break;
                
                case TrackingState.Limited:
                    SetLabelsAlpha(0.5f);
                    break;
                
                case TrackingState.None:
                    _trackingLostTime = 0f;
                    SetLabelsAlpha(0.3f);
                    break;
            }
        }
        
        public void SetLabelsVisible(bool visible)
        {
            LabelsVisible = visible;
            foreach (var label in _labels)
            {
                label.gameObject.SetActive(visible);
            }
        }
        
        public bool TrySelectPart(string partId)
        {
            if (!_partInfos.ContainsKey(partId))
                return false;
            
            SelectPart(partId);
            return true;
        }
        
        public bool TrySelectByRay(Vector2 screenPos)
        {
            var ray = _arCamera.ScreenPointToRay(screenPos);
            
            if (Physics.Raycast(ray, out var hit, 5f, plantLayer))
            {
                var partId = MapHitToPartId(hit.transform);
                if (!string.IsNullOrEmpty(partId))
                {
                    SelectPart(partId);
                    return true;
                }
            }
            
            return false;
        }
        
        private void SelectPart(string partId)
        {
            _selectedPartId = partId;
            
            // Find part data
            var part = System.Array.Find(_plantData.parts, p => p.partId == partId);
            if (part == null) return;
            
            // Highlight mesh briefly
            if (_partInfos.TryGetValue(partId, out var info) && info.mesh != null)
            {
                HighlightMesh(info.mesh, 0.15f);
            }
            
            // Show info panel
            var infoPanel = FindObjectOfType<InfoPanelController>();
            infoPanel?.Show(part);
            
            Debug.Log($"[TrackedPlantController] Selected part: {part.displayName}");
        }
        
        private string MapHitToPartId(Transform hitTransform)
        {
            // Walk up hierarchy to find matching mesh
            var current = hitTransform;
            while (current != null && current != _modelInstance.transform)
            {
                foreach (var kvp in _partInfos)
                {
                    if (kvp.Value.mesh == current)
                        return kvp.Key;
                }
                current = current.parent;
            }
            
            return null;
        }
        
        public void HighlightPart(string partId, float duration)
        {
            if (_partInfos.TryGetValue(partId, out var info) && info.mesh != null)
            {
                HighlightMesh(info.mesh, duration);
            }
        }
        
        private void HighlightMesh(Transform mesh, float duration)
        {
            // Simple rim highlight via material property block
            var renderer = mesh.GetComponent<Renderer>();
            if (renderer == null) return;
            
            var block = new MaterialPropertyBlock();
            renderer.GetPropertyBlock(block);
            block.SetFloat("_RimPower", 2f);
            block.SetColor("_RimColor", Color.yellow);
            renderer.SetPropertyBlock(block);
            
            // Reset after duration
            StartCoroutine(ResetHighlightAfter(renderer, duration));
        }
        
        private System.Collections.IEnumerator ResetHighlightAfter(Renderer renderer, float delay)
        {
            yield return new WaitForSeconds(delay);
            
            if (renderer != null)
            {
                var block = new MaterialPropertyBlock();
                renderer.GetPropertyBlock(block);
                block.SetFloat("_RimPower", 0f);
                renderer.SetPropertyBlock(block);
            }
        }
        
        private void SetModelAlpha(float alpha)
        {
            // Fade entire model (simple version; production may use shader graph)
            if (_modelInstance == null) return;
            
            var renderers = _modelInstance.GetComponentsInChildren<Renderer>();
            foreach (var r in renderers)
            {
                var block = new MaterialPropertyBlock();
                r.GetPropertyBlock(block);
                block.SetFloat("_Alpha", alpha);
                r.SetPropertyBlock(block);
            }
        }
        
        private void SetLabelsAlpha(float alpha)
        {
            foreach (var label in _labels)
            {
                label.SetAlpha(alpha);
            }
        }
    }
}