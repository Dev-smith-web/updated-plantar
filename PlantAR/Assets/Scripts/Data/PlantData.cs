using UnityEngine;
using UnityEngine.AddressableAssets;
using System;

namespace PlantAR.Data
{
    /// <summary>
    /// Primary plant content container. One per plant species.
    /// </summary>
    [CreateAssetMenu(fileName = "PlantData", menuName = "PlantAR/Plant Data", order = 1)]
    public class PlantData : ScriptableObject
    {
        [Header("Identity")]
        public string plantId;
        public string displayName;
        
        [Header("Tracking")]
        [Tooltip("GUID string from the Reference Image Library entry")]
        public string referenceImageGuid;
        public Sprite targetPreview;
        
        [Header("Model")]
        public AssetReferenceGameObject modelPrefab;
        
        [Header("Content")]
        public PartData[] parts = Array.Empty<PartData>();
        public QuizItem[] quizItems = Array.Empty<QuizItem>();
        
        #if UNITY_EDITOR
        [ContextMenu("Validate")]
        private void Validate()
        {
            if (string.IsNullOrEmpty(plantId))
                Debug.LogError($"[{name}] plantId is required", this);
            
            if (string.IsNullOrEmpty(referenceImageGuid))
                Debug.LogWarning($"[{name}] referenceImageGuid not set", this);
            
            if (parts.Length == 0)
                Debug.LogWarning($"[{name}] No parts defined", this);
            
            foreach (var part in parts)
            {
                if (string.IsNullOrEmpty(part.partId))
                    Debug.LogError($"[{name}] Part with empty partId", this);
                
                if (part.shortDefinition.Length > 140)
                    Debug.LogWarning($"[{name}] Part '{part.partId}' definition exceeds 140 chars", this);
            }
            
            foreach (var quiz in quizItems)
            {
                if (quiz.choices == null || quiz.choices.Length < 2)
                    Debug.LogError($"[{name}] Quiz needs 2-4 choices", this);
            }
        }
        #endif
    }
    
    /// <summary>
    /// Individual plant part (stem, leaf, root, etc.)
    /// </summary>
    [Serializable]
    public class PartData
    {
        [Header("Identity")]
        public string partId;
        public string displayName;
        
        [Header("Content")]
        [TextArea(2, 4)]
        public string shortDefinition;
        public Sprite icon;
        public AudioClip audio;
        
        [Header("Scene Paths")]
        [Tooltip("Path to empty transform for label position, e.g., 'Sunflower/Stem/LabelAnchor'")]
        public string attachNodePath;
        
        [Tooltip("Path to mesh for hit-testing, e.g., 'Sunflower/Stem'")]
        public string meshNodePath;
    }
    
    /// <summary>
    /// Quiz question configuration
    /// </summary>
    [Serializable]
    public class QuizItem
    {
        public QuizType type;
        
        [TextArea(1, 3)]
        public string promptText;
        
        [Tooltip("For IdentifyPart: partId to highlight. For others: correct answer text")]
        public string correctAnswerId;
        
        [Tooltip("2-4 answer choices")]
        public string[] choices = Array.Empty<string>();
        
        [TextArea(1, 2)]
        public string hint;
    }
    
    public enum QuizType
    {
        IdentifyPart,      // Show highlighted mesh, ask "What is this?"
        IdentifyFunction,  // Ask "Which part does X?" with part names as choices
        TrueFalse         // Statement with True/False buttons
    }
}