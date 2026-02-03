using UnityEngine;
using UnityEngine.XR.ARSubsystems;
using PlantAR.Data;

#if UNITY_EDITOR
using UnityEditor;
using System.Linq;

namespace PlantAR.Editor
{
    /// <summary>
    /// Validates plant content integrity at edit time and in CI.
    /// Ensures all paths, references, and data are valid before build.
    /// </summary>
    public static class ContentValidator
    {
        [MenuItem("PlantAR/Validate All Content")]
        public static void ValidateAll()
        {
            bool allValid = true;
            
            // Find all PlantData assets
            string[] guids = AssetDatabase.FindAssets("t:PlantData");
            Debug.Log($"[ContentValidator] Found {guids.Length} PlantData assets");
            
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                var plant = AssetDatabase.LoadAssetAtPath<PlantData>(path);
                
                if (!ValidatePlant(plant))
                    allValid = false;
            }
            
            if (allValid)
            {
                Debug.Log("[ContentValidator] ✅ All content valid!");
            }
            else
            {
                Debug.LogError("[ContentValidator] ❌ Validation failed. See errors above.");
            }
        }
        
        private static bool ValidatePlant(PlantData plant)
        {
            bool valid = true;
            string name = plant.name;
            
            // Check basic fields
            if (string.IsNullOrEmpty(plant.plantId))
            {
                Debug.LogError($"[{name}] Missing plantId", plant);
                valid = false;
            }
            
            if (string.IsNullOrEmpty(plant.displayName))
            {
                Debug.LogError($"[{name}] Missing displayName", plant);
                valid = false;
            }
            
            // Check reference image GUID
            if (string.IsNullOrEmpty(plant.referenceImageGuid))
            {
                Debug.LogWarning($"[{name}] Missing referenceImageGuid", plant);
                valid = false;
            }
            else
            {
                if (!ValidateReferenceImageGuid(plant.referenceImageGuid))
                {
                    Debug.LogError($"[{name}] referenceImageGuid '{plant.referenceImageGuid}' not found in any Reference Image Library", plant);
                    valid = false;
                }
            }
            
            // Check model prefab
            if (plant.modelPrefab == null || !plant.modelPrefab.RuntimeKeyIsValid())
            {
                Debug.LogError($"[{name}] Invalid or missing modelPrefab reference", plant);
                valid = false;
            }
            else
            {
                // Validate paths in loaded prefab
                var prefabOp = plant.modelPrefab.LoadAssetAsync<GameObject>();
                prefabOp.WaitForCompletion();
                
                if (prefabOp.Result != null)
                {
                    if (!ValidatePartPaths(plant, prefabOp.Result))
                        valid = false;
                    
                    UnityEngine.AddressableAssets.Addressables.Release(prefabOp);
                }
            }
            
            // Validate parts
            if (plant.parts == null || plant.parts.Length == 0)
            {
                Debug.LogWarning($"[{name}] No parts defined", plant);
            }
            else
            {
                foreach (var part in plant.parts)
                {
                    if (!ValidatePart(plant, part))
                        valid = false;
                }
            }
            
            // Validate quiz items
            if (plant.quizItems != null)
            {
                foreach (var quiz in plant.quizItems)
                {
                    if (!ValidateQuizItem(plant, quiz))
                        valid = false;
                }
            }
            
            if (valid)
                Debug.Log($"[{name}] ✅ Valid");
            
            return valid;
        }
        
        private static bool ValidatePart(PlantData plant, PartData part)
        {
            bool valid = true;
            string context = $"[{plant.name}] Part '{part.partId}'";
            
            if (string.IsNullOrEmpty(part.partId))
            {
                Debug.LogError($"{context}: Missing partId", plant);
                valid = false;
            }
            
            if (string.IsNullOrEmpty(part.displayName))
            {
                Debug.LogError($"{context}: Missing displayName", plant);
                valid = false;
            }
            
            if (part.shortDefinition.Length > 140)
            {
                Debug.LogWarning($"{context}: Definition exceeds 140 chars ({part.shortDefinition.Length})", plant);
            }
            
            if (string.IsNullOrEmpty(part.attachNodePath))
            {
                Debug.LogWarning($"{context}: Missing attachNodePath", plant);
            }
            
            if (string.IsNullOrEmpty(part.meshNodePath))
            {
                Debug.LogWarning($"{context}: Missing meshNodePath", plant);
            }
            
            return valid;
        }
        
        private static bool ValidatePartPaths(PlantData plant, GameObject prefab)
        {
            bool valid = true;
            
            foreach (var part in plant.parts)
            {
                // Check anchor path
                if (!string.IsNullOrEmpty(part.attachNodePath))
                {
                    var anchor = prefab.transform.Find(part.attachNodePath);
                    if (anchor == null)
                    {
                        Debug.LogError($"[{plant.name}] Part '{part.partId}' attachNodePath not found: {part.attachNodePath}", plant);
                        valid = false;
                    }
                }
                
                // Check mesh path
                if (!string.IsNullOrEmpty(part.meshNodePath))
                {
                    var mesh = prefab.transform.Find(part.meshNodePath);
                    if (mesh == null)
                    {
                        Debug.LogError($"[{plant.name}] Part '{part.partId}' meshNodePath not found: {part.meshNodePath}", plant);
                        valid = false;
                    }
                }
            }
            
            return valid;
        }
        
        private static bool ValidateQuizItem(PlantData plant, QuizItem quiz)
        {
            bool valid = true;
            string context = $"[{plant.name}] Quiz";
            
            if (string.IsNullOrEmpty(quiz.promptText))
            {
                Debug.LogError($"{context}: Missing promptText", plant);
                valid = false;
            }
            
            if (quiz.choices == null || quiz.choices.Length < 2 || quiz.choices.Length > 4)
            {
                Debug.LogError($"{context}: Must have 2-4 choices (has {quiz.choices?.Length ?? 0})", plant);
                valid = false;
            }
            
            if (string.IsNullOrEmpty(quiz.correctAnswerId))
            {
                Debug.LogError($"{context}: Missing correctAnswerId", plant);
                valid = false;
            }
            
            // For IdentifyPart, verify correctAnswerId matches a partId
            if (quiz.type == QuizType.IdentifyPart)
            {
                bool foundPart = plant.parts.Any(p => p.partId == quiz.correctAnswerId);
                if (!foundPart)
                {
                    Debug.LogError($"{context}: IdentifyPart correctAnswerId '{quiz.correctAnswerId}' doesn't match any part", plant);
                    valid = false;
                }
            }
            
            return valid;
        }
        
        private static bool ValidateReferenceImageGuid(string guid)
        {
            // Find all XRReferenceImageLibrary assets
            string[] libraryGuids = AssetDatabase.FindAssets("t:XRReferenceImageLibrary");
            
            foreach (string libGuid in libraryGuids)
            {
                string path = AssetDatabase.GUIDToAssetPath(libGuid);
                var library = AssetDatabase.LoadAssetAtPath<XRReferenceImageLibrary>(path);
                
                if (library != null)
                {
                    for (int i = 0; i < library.count; i++)
                    {
                        var entry = library[i];
                        if (entry.guid.ToString() == guid)
                            return true;
                    }
                }
            }
            
            return false;
        }
    }
    
    /// <summary>
    /// Custom inspector for PlantData with validation button.
    /// </summary>
    [CustomEditor(typeof(PlantData))]
    public class PlantDataEditor : UnityEditor.Editor
    {
        public override void OnInspectorGUI()
        {
            DrawDefaultInspector();
            
            EditorGUILayout.Space();
            
            if (GUILayout.Button("Validate This Plant", GUILayout.Height(30)))
            {
                var plant = target as PlantData;
                ContentValidator.ValidateAll();
            }
        }
    }
}
#endif