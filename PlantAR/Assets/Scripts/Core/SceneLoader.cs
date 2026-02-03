using UnityEngine;
using UnityEngine.SceneManagement;

namespace PlantAR.Core
{
    /// <summary>
    /// Simple helper for loading scenes.
    /// Attach to UI buttons or call from code.
    /// </summary>
    public class SceneLoader : MonoBehaviour
    {
        public void LoadScene(string sceneName)
        {
            Debug.Log($"[SceneLoader] Loading scene: {sceneName}");
            SceneManager.LoadScene(sceneName);
        }
        
        public void LoadARScene()
        {
            LoadScene("ARScene");
        }
        
        public void LoadHome()
        {
            LoadScene("Home");
        }
        
        public void QuitApp()
        {
            Debug.Log("[SceneLoader] Quitting application");
            Application.Quit();
        }
    }
}