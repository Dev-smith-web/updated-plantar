using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.EventSystems;
using PlantAR.AR;
using PlantAR.UI;

namespace PlantAR.Input
{
    /// <summary>
    /// Handles touch input for AR scene: tap to select, pinch to scale.
    /// Respects UI priority (quiz overlay, info panel, labels).
    /// </summary>
    public class ARInputHandler : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TrackedImageSpawner spawner;
        [SerializeField] private EventSystem eventSystem;
        
        [Header("Pinch Settings")]
        [SerializeField] private float minScale = 0.7f;
        [SerializeField] private float maxScale = 1.5f;
        [SerializeField] private float scaleSpeed = 0.5f;
        
        private PlayerInput _playerInput;
        private InputAction _tapAction;
        private InputAction _positionAction;
        
        private TrackedPlantController _plantController;
        private float _currentScale = 1f;
        private Vector2 _previousTouch0;
        private Vector2 _previousTouch1;
        
        private void Awake()
        {
            _playerInput = GetComponent<PlayerInput>();
            
            if (_playerInput != null)
            {
                _tapAction = _playerInput.actions["Tap"];
                _positionAction = _playerInput.actions["Position"];
            }
        }
        
        private void OnEnable()
        {
            if (spawner != null)
            {
                spawner.OnPlantSpawned += OnPlantSpawned;
                spawner.OnPlantDespawned += OnPlantDespawned;
            }
            
            if (_tapAction != null)
                _tapAction.performed += OnTapPerformed;
        }
        
        private void OnDisable()
        {
            if (spawner != null)
            {
                spawner.OnPlantSpawned -= OnPlantSpawned;
                spawner.OnPlantDespawned -= OnPlantDespawned;
            }
            
            if (_tapAction != null)
                _tapAction.performed -= OnTapPerformed;
        }
        
        private void Update()
        {
            // Handle pinch-to-scale
            if (Touchscreen.current != null && Touchscreen.current.touches.Count == 2)
            {
                HandlePinch();
            }
        }
        
        private void OnPlantSpawned(PlantAR.Data.PlantData plant)
        {
            _plantController = spawner.GetActiveController();
            _currentScale = 1f;
        }
        
        private void OnPlantDespawned()
        {
            _plantController = null;
        }
        
        private void OnTapPerformed(InputAction.CallbackContext context)
        {
            if (_plantController == null) return;
            
            Vector2 screenPos = _positionAction.ReadValue<Vector2>();
            
            // Priority 1: Check if UI consumed the tap
            if (IsPointerOverUI(screenPos))
                return;
            
            // Priority 2: Try selecting via physics raycast
            if (_plantController.TrySelectByRay(screenPos))
                return;
            
            // No selection made
            Debug.Log("[ARInputHandler] Tap did not hit any part");
        }
        
        private void HandlePinch()
        {
            if (_plantController == null) return;
            
            var touch0 = Touchscreen.current.touches[0];
            var touch1 = Touchscreen.current.touches[1];
            
            Vector2 pos0 = touch0.position.ReadValue();
            Vector2 pos1 = touch1.position.ReadValue();
            
            // Skip first frame of pinch
            if (touch0.phase.ReadValue() == UnityEngine.InputSystem.TouchPhase.Began ||
                touch1.phase.ReadValue() == UnityEngine.InputSystem.TouchPhase.Began)
            {
                _previousTouch0 = pos0;
                _previousTouch1 = pos1;
                return;
            }
            
            // Calculate distance delta
            float prevDistance = Vector2.Distance(_previousTouch0, _previousTouch1);
            float currentDistance = Vector2.Distance(pos0, pos1);
            float delta = currentDistance - prevDistance;
            
            // Apply scale
            float scaleChange = delta * scaleSpeed * Time.deltaTime;
            _currentScale = Mathf.Clamp(_currentScale + scaleChange, minScale, maxScale);
            
            // Apply to model mount
            var modelMount = _plantController.ModelMount;
            if (modelMount != null)
            {
                modelMount.localScale = Vector3.one * _currentScale;
            }
            
            _previousTouch0 = pos0;
            _previousTouch1 = pos1;
        }
        
        private bool IsPointerOverUI(Vector2 screenPos)
        {
            if (eventSystem == null) return false;
            
            var pointerData = new PointerEventData(eventSystem)
            {
                position = screenPos
            };
            
            var results = new System.Collections.Generic.List<RaycastResult>();
            eventSystem.RaycastAll(pointerData, results);
            
            return results.Count > 0;
        }
    }
}