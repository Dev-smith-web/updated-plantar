using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace PlantAR.UI
{
    /// <summary>
    /// Simple toast notification system.
    /// Shows brief, auto-dismissing messages to the user.
    /// </summary>
    public class Toast : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject toastRoot;
        [SerializeField] private TMP_Text messageText;
        [SerializeField] private CanvasGroup canvasGroup;
        
        [Header("Settings")]
        [SerializeField] private float displayDuration = 2f;
        [SerializeField] private float fadeDuration = 0.3f;
        
        private static Toast _instance;
        private Coroutine _currentToast;
        
        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            _instance = this;
            toastRoot.SetActive(false);
        }
        
        /// <summary>
        /// Show a toast message. Static for easy access from anywhere.
        /// </summary>
        public static void Show(string message)
        {
            if (_instance == null)
            {
                Debug.LogWarning($"[Toast] No instance found. Message: {message}");
                return;
            }
            
            _instance.ShowToast(message);
        }
        
        private void ShowToast(string message)
        {
            // Cancel existing toast
            if (_currentToast != null)
            {
                StopCoroutine(_currentToast);
            }
            
            messageText.text = message;
            _currentToast = StartCoroutine(ToastSequence());
            
            Debug.Log($"[Toast] {message}");
        }
        
        private IEnumerator ToastSequence()
        {
            // Fade in
            toastRoot.SetActive(true);
            yield return FadeTo(1f, fadeDuration);
            
            // Display
            yield return new WaitForSeconds(displayDuration);
            
            // Fade out
            yield return FadeTo(0f, fadeDuration);
            toastRoot.SetActive(false);
            
            _currentToast = null;
        }
        
        private IEnumerator FadeTo(float target, float duration)
        {
            float start = canvasGroup.alpha;
            float elapsed = 0f;
            
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                canvasGroup.alpha = Mathf.Lerp(start, target, elapsed / duration);
                yield return null;
            }
            
            canvasGroup.alpha = target;
        }
    }
}