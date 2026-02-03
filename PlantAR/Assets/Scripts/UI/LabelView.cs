using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantAR.Data;

namespace PlantAR.UI
{
    /// <summary>
    /// World-space label that billboards to camera and handles occlusion.
    /// Tap to select the associated plant part.
    /// </summary>
    [RequireComponent(typeof(Canvas))]
    public class LabelView : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private TMP_Text labelText;
        [SerializeField] private CanvasGroup canvasGroup;
        [SerializeField] private Button button;
        
        [Header("Billboard Settings")]
        [SerializeField] private float minDistance = 0.2f;
        [SerializeField] private float maxDistance = 1.2f;
        [SerializeField] private float minScale = 0.9f;
        [SerializeField] private float maxScale = 1.2f;
        
        [Header("Occlusion")]
        [SerializeField] private float occlusionOffset = 0.03f;
        [SerializeField] private float occludedAlpha = 0.6f;
        
        private Transform _anchor;
        private PartData _partData;
        private bool _occluded;
        private float _baseAlpha = 1f;
        
        public event Action OnTapped;
        
        private void Awake()
        {
            if (button != null)
                button.onClick.AddListener(() => OnTapped?.Invoke());
        }
        
        public void Bind(PartData part)
        {
            _partData = part;
            if (labelText != null)
                labelText.text = part.displayName;
        }
        
        public void SetAnchor(Transform anchor)
        {
            _anchor = anchor;
            if (_anchor != null)
                transform.position = _anchor.position;
        }
        
        public void SetAlpha(float alpha)
        {
            _baseAlpha = alpha;
            UpdateAlpha();
        }
        
        /// <summary>
        /// Called per frame to update billboard rotation, scale, and occlusion.
        /// </summary>
        public void TickBillboard(Camera arCamera, LayerMask plantLayer)
        {
            if (_anchor == null || arCamera == null) return;
            
            // Sync position
            transform.position = _anchor.position;
            
            // Billboard rotation (yaw only, y-locked)
            var toCam = arCamera.transform.position - transform.position;
            toCam.y = 0f;
            
            if (toCam.sqrMagnitude > 0.001f)
            {
                transform.forward = toCam.normalized;
            }
            
            // Distance-based scale
            float distance = Vector3.Distance(arCamera.transform.position, transform.position);
            float t = Mathf.InverseLerp(minDistance, maxDistance, distance);
            t = Mathf.SmoothStep(0f, 1f, t);
            float scale = Mathf.Lerp(minScale, maxScale, t);
            transform.localScale = Vector3.one * scale;
            
            // Occlusion check
            CheckOcclusion(arCamera, plantLayer);
        }
        
        private void CheckOcclusion(Camera cam, LayerMask layer)
        {
            var ray = new Ray(cam.transform.position, transform.position - cam.transform.position);
            float distToAnchor = Vector3.Distance(cam.transform.position, transform.position);
            
            if (Physics.Raycast(ray, out var hit, distToAnchor - 0.01f, layer))
            {
                // Occluded by plant mesh
                if (!_occluded)
                {
                    _occluded = true;
                    
                    // Nudge label outward slightly
                    var offset = (transform.position - cam.transform.position).normalized * occlusionOffset;
                    transform.position += offset;
                }
                
                UpdateAlpha();
            }
            else
            {
                // Not occluded
                if (_occluded)
                {
                    _occluded = false;
                    transform.position = _anchor.position; // Reset to anchor
                }
                
                UpdateAlpha();
            }
        }
        
        private void UpdateAlpha()
        {
            if (canvasGroup == null) return;
            
            float target = _baseAlpha;
            if (_occluded)
                target *= occludedAlpha;
            
            canvasGroup.alpha = target;
        }
    }
}