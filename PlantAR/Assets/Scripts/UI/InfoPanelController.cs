using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantAR.Data;

namespace PlantAR.UI
{
    /// <summary>
    /// Bottom sheet info panel showing selected part details.
    /// </summary>
    public class InfoPanelController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject panelRoot;
        [SerializeField] private TMP_Text titleText;
        [SerializeField] private TMP_Text definitionText;
        [SerializeField] private Image iconImage;
        [SerializeField] private Button audioButton;
        [SerializeField] private Button closeButton;
        
        [Header("Animation")]
        [SerializeField] private float slideInDuration = 0.3f;
        [SerializeField] private AnimationCurve slideInCurve = AnimationCurve.EaseInOut(0, 0, 1, 1);
        
        private RectTransform _rectTransform;
        private AudioSource _audioSource;
        private PartData _currentPart;
        private float _hiddenY;
        private float _visibleY;
        
        public event Action OnOpened;
        public event Action OnClosed;
        
        private void Awake()
        {
            _rectTransform = panelRoot.GetComponent<RectTransform>();
            _audioSource = gameObject.AddComponent<AudioSource>();
            _audioSource.playOnAwake = false;
            
            closeButton.onClick.AddListener(Hide);
            audioButton.onClick.AddListener(PlayAudio);
            
            // Calculate slide positions
            _visibleY = _rectTransform.anchoredPosition.y;
            _hiddenY = _visibleY - _rectTransform.rect.height;
            
            // Start hidden
            panelRoot.SetActive(false);
        }
        
        public void Show(PartData part)
        {
            if (part == null)
            {
                Debug.LogWarning("[InfoPanelController] Cannot show null part");
                return;
            }
            
            _currentPart = part;
            
            // Update UI
            titleText.text = part.displayName;
            definitionText.text = part.shortDefinition;
            
            if (part.icon != null)
            {
                iconImage.sprite = part.icon;
                iconImage.gameObject.SetActive(true);
            }
            else
            {
                iconImage.gameObject.SetActive(false);
            }
            
            // Show/hide audio button
            audioButton.gameObject.SetActive(part.audio != null);
            
            // Animate in
            panelRoot.SetActive(true);
            StopAllCoroutines();
            StartCoroutine(AnimateSlide(_hiddenY, _visibleY));
            
            OnOpened?.Invoke();
            
            Debug.Log($"[InfoPanelController] Showing: {part.displayName}");
        }
        
        public void Hide()
        {
            StopAllCoroutines();
            StartCoroutine(AnimateSlideAndHide());
            
            OnClosed?.Invoke();
        }
        
        private void PlayAudio()
        {
            if (_currentPart?.audio == null)
                return;
            
            _audioSource.clip = _currentPart.audio;
            _audioSource.Play();
            
            Debug.Log($"[InfoPanelController] Playing audio for {_currentPart.displayName}");
        }
        
        private System.Collections.IEnumerator AnimateSlide(float from, float to)
        {
            float elapsed = 0f;
            
            while (elapsed < slideInDuration)
            {
                elapsed += Time.deltaTime;
                float t = slideInCurve.Evaluate(elapsed / slideInDuration);
                float y = Mathf.Lerp(from, to, t);
                
                _rectTransform.anchoredPosition = new Vector2(_rectTransform.anchoredPosition.x, y);
                
                yield return null;
            }
            
            _rectTransform.anchoredPosition = new Vector2(_rectTransform.anchoredPosition.x, to);
        }
        
        private System.Collections.IEnumerator AnimateSlideAndHide()
        {
            yield return AnimateSlide(_visibleY, _hiddenY);
            panelRoot.SetActive(false);
        }
    }
}
