using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PlantAR.Data;
using PlantAR.AR;

namespace PlantAR.Quiz
{
    /// <summary>
    /// Manages quiz overlay state, questions, and scoring.
    /// Hides labels during quiz, highlights parts for IdentifyPart questions.
    /// </summary>
    public class QuizController : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject overlayRoot;
        [SerializeField] private TMP_Text promptText;
        [SerializeField] private TMP_Text hintText;
        [SerializeField] private Button[] choiceButtons;
        [SerializeField] private TMP_Text[] choiceTexts;
        [SerializeField] private GameObject feedbackPanel;
        [SerializeField] private TMP_Text feedbackText;
        [SerializeField] private Button nextButton;
        [SerializeField] private GameObject resultsPanel;
        [SerializeField] private TMP_Text resultsText;
        [SerializeField] private Button retryButton;
        [SerializeField] private Button doneButton;
        
        [Header("Feedback")]
        [SerializeField] private Color correctColor = Color.green;
        [SerializeField] private Color incorrectColor = Color.red;
        [SerializeField] private float feedbackDuration = 0.8f;
        
        private TrackedPlantController _plantController;
        private PlantData _plantData;
        private QuizItem[] _quizItems;
        private int _currentIndex;
        private int _score;
        private int _attempts;
        private bool _awaitingNext;
        
        public event Action<int, int> OnQuizCompleted; // score, total
        
        private void Awake()
        {
            // Wire up choice buttons
            for (int i = 0; i < choiceButtons.Length; i++)
            {
                int index = i; // Capture for closure
                choiceButtons[i].onClick.AddListener(() => OnChoiceSelected(index));
            }
            
            nextButton.onClick.AddListener(OnNextClicked);
            retryButton.onClick.AddListener(RestartQuiz);
            doneButton.onClick.AddListener(EndQuiz);
            
            overlayRoot.SetActive(false);
        }
        
        public void StartQuiz(PlantData plant, TrackedPlantController controller)
        {
            _plantData = plant;
            _plantController = controller;
            _quizItems = plant.quizItems;
            _currentIndex = 0;
            _score = 0;
            
            if (_quizItems == null || _quizItems.Length == 0)
            {
                Debug.LogWarning("[QuizController] No quiz items for this plant");
                return;
            }
            
            // Hide labels during quiz
            _plantController.SetLabelsVisible(false);
            
            overlayRoot.SetActive(true);
            resultsPanel.SetActive(false);
            
            ShowQuestion(_currentIndex);
            
            Debug.Log($"[QuizController] Started quiz with {_quizItems.Length} questions");
        }
        
        private void ShowQuestion(int index)
        {
            if (index >= _quizItems.Length)
            {
                ShowResults();
                return;
            }
            
            var item = _quizItems[index];
            _attempts = 0;
            _awaitingNext = false;
            
            promptText.text = item.promptText;
            hintText.text = string.Empty;
            hintText.gameObject.SetActive(false);
            feedbackPanel.SetActive(false);
            nextButton.gameObject.SetActive(false);
            
            // Setup choices
            int numChoices = Mathf.Min(item.choices.Length, choiceButtons.Length);
            for (int i = 0; i < choiceButtons.Length; i++)
            {
                if (i < numChoices)
                {
                    choiceButtons[i].gameObject.SetActive(true);
                    choiceButtons[i].interactable = true;
                    choiceTexts[i].text = item.choices[i];
                    
                    // Reset visual state
                    var colors = choiceButtons[i].colors;
                    colors.normalColor = Color.white;
                    choiceButtons[i].colors = colors;
                }
                else
                {
                    choiceButtons[i].gameObject.SetActive(false);
                }
            }
            
            // Handle IdentifyPart type: highlight the mesh
            if (item.type == QuizType.IdentifyPart)
            {
                StartCoroutine(HighlightPartForQuestion(item.correctAnswerId, 1.5f));
            }
        }
        
        private IEnumerator HighlightPartForQuestion(string partId, float duration)
        {
            yield return new WaitForSeconds(0.2f); // Brief delay for UI to settle
            _plantController?.HighlightPart(partId, duration);
        }
        
        private void OnChoiceSelected(int choiceIndex)
        {
            if (_awaitingNext) return;
            
            var item = _quizItems[_currentIndex];
            string selectedAnswer = item.choices[choiceIndex];
            bool correct = selectedAnswer == item.correctAnswerId;
            
            _attempts++;
            
            if (correct)
            {
                HandleCorrectAnswer(choiceIndex);
            }
            else
            {
                HandleIncorrectAnswer(choiceIndex, item);
            }
        }
        
        private void HandleCorrectAnswer(int choiceIndex)
        {
            // Award point only on first try
            if (_attempts == 1)
                _score++;
            
            // Visual feedback
            SetButtonColor(choiceIndex, correctColor);
            ShowFeedback("✅ Correct!", correctColor);
            
            // Haptic (platform-specific)
            #if UNITY_IOS || UNITY_ANDROID
            Handheld.Vibrate();
            #endif
            
            // Disable all buttons
            foreach (var btn in choiceButtons)
                btn.interactable = false;
            
            _awaitingNext = true;
            nextButton.gameObject.SetActive(true);
        }
        
        private void HandleIncorrectAnswer(int choiceIndex, QuizItem item)
        {
            SetButtonColor(choiceIndex, incorrectColor);
            
            if (_attempts == 1 && !string.IsNullOrEmpty(item.hint))
            {
                // First miss: show hint, allow retry
                ShowFeedback("❌ Not quite...", incorrectColor);
                hintText.text = $"Hint: {item.hint}";
                hintText.gameObject.SetActive(true);
            }
            else
            {
                // Second miss or no hint: reveal answer, move on
                ShowFeedback($"❌ Correct answer: {item.correctAnswerId}", incorrectColor);
                
                // Disable all buttons
                foreach (var btn in choiceButtons)
                    btn.interactable = false;
                
                _awaitingNext = true;
                nextButton.gameObject.SetActive(true);
            }
        }
        
        private void SetButtonColor(int index, Color color)
        {
            var colors = choiceButtons[index].colors;
            colors.normalColor = color;
            colors.highlightedColor = color;
            choiceButtons[index].colors = colors;
        }
        
        private void ShowFeedback(string message, Color color)
        {
            feedbackText.text = message;
            feedbackText.color = color;
            feedbackPanel.SetActive(true);
        }
        
        private void OnNextClicked()
        {
            _currentIndex++;
            ShowQuestion(_currentIndex);
        }
        
        private void ShowResults()
        {
            feedbackPanel.SetActive(false);
            resultsPanel.SetActive(true);
            
            int total = _quizItems.Length;
            float percentage = (float)_score / total * 100f;
            
            resultsText.text = $"Quiz Complete!\n\nYou got {_score}/{total}\n({percentage:F0}%)";
            
            OnQuizCompleted?.Invoke(_score, total);
            
            Debug.Log($"[QuizController] Quiz completed: {_score}/{total}");
        }
        
        private void RestartQuiz()
        {
            _currentIndex = 0;
            _score = 0;
            resultsPanel.SetActive(false);
            ShowQuestion(0);
        }
        
        private void EndQuiz()
        {
            overlayRoot.SetActive(false);
            
            // Restore labels
            _plantController?.SetLabelsVisible(true);
            
            Debug.Log("[QuizController] Quiz ended");
        }
    }
}