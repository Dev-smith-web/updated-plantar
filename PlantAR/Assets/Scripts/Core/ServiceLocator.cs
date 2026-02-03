using System;
using System.Collections.Generic;
using UnityEngine;

namespace PlantAR.Core
{
    /// <summary>
    /// Simple service locator for MVP. 
    /// Production apps should use proper DI (VContainer, Zenject).
    /// </summary>
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();
        
        public static void Register<T>(T service) where T : class
        {
            var type = typeof(T);
            
            if (_services.ContainsKey(type))
            {
                Debug.LogWarning($"[ServiceLocator] Service {type.Name} already registered. Replacing.");
            }
            
            _services[type] = service;
            Debug.Log($"[ServiceLocator] Registered {type.Name}");
        }
        
        public static T Get<T>() where T : class
        {
            var type = typeof(T);
            
            if (_services.TryGetValue(type, out var service))
            {
                return service as T;
            }
            
            Debug.LogError($"[ServiceLocator] Service {type.Name} not found!");
            return null;
        }
        
        public static bool TryGet<T>(out T service) where T : class
        {
            var type = typeof(T);
            
            if (_services.TryGetValue(type, out var obj))
            {
                service = obj as T;
                return service != null;
            }
            
            service = null;
            return false;
        }
        
        public static void Clear()
        {
            _services.Clear();
            Debug.Log("[ServiceLocator] Cleared all services");
        }
    }
    
    /// <summary>
    /// Bootstrap scene initialization.
    /// Sets up persistent services before loading Home.
    /// </summary>
    public class AppBootstrap : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private int targetFrameRate = 60;
        [SerializeField] private string firstSceneName = "Home";
        
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            
            // Lock frame rate
            Application.targetFrameRate = targetFrameRate;
            
            // Prevent screen dimming
            Screen.sleepTimeout = SleepTimeout.NeverSleep;
            
            Debug.Log($"[AppBootstrap] Target FPS: {targetFrameRate}");
        }
        
        private async void Start()
        {
            // Register core services
            var contentProvider = new ContentProvider();
            ServiceLocator.Register<IContentProvider>(contentProvider);
            
            // Warm up Addressables (synchronous for MVP with embedded catalog)
            try
            {
                await UnityEngine.AddressableAssets.Addressables.InitializeAsync().Task;
                Debug.Log("[AppBootstrap] Addressables initialized");
            }
            catch (Exception ex)
            {
                Debug.LogError($"[AppBootstrap] Addressables init failed: {ex.Message}");
            }
            
            // Load first scene
            Debug.Log($"[AppBootstrap] Loading scene: {firstSceneName}");
            UnityEngine.SceneManagement.SceneManager.LoadScene(firstSceneName);
        }
        
        private void OnDestroy()
        {
            // Cleanup on app quit
            if (ServiceLocator.TryGet<IContentProvider>(out var provider))
            {
                provider.ReleaseAll();
            }
            
            ServiceLocator.Clear();
        }
    }
}