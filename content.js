// Content Script for Grammar Corrector Extension

// Create and inject CSS
function injectStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(link);
}

// Create a floating button element that will appear when text is selected
const createFloatingButton = () => {
  const button = document.createElement('button');
  button.textContent = 'Correct';
  button.className = 'grammar-corrector-button';
  button.style.position = 'absolute';
  button.style.zIndex = '9999';
  button.addEventListener('mousedown', createRipple);
  return button;
};

// Add ripple effect to buttons
function createRipple(event) {
  const button = event.currentTarget;
  
  // Remove any existing ripple
  const ripples = button.getElementsByClassName('ripple');
  while (ripples.length > 0) {
    ripples[0].remove();
  }
  
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  // Create the ripple element
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
  circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
  circle.classList.add('ripple');
  
  button.appendChild(circle);
  
  // Remove the ripple after animation completes
  setTimeout(() => {
    circle.remove();
  }, 600);
}

// Create a result modal to show the corrected text
const createResultModal = () => {
  // Create modal container
  const modal = document.createElement('div');
  modal.className = 'grammar-corrector-modal';
  
  // Create modal header
  const header = document.createElement('div');
  header.className = 'grammar-corrector-modal-header';
  
  // Add title
  const title = document.createElement('h3');
  title.textContent = 'Corrected Text';
  header.appendChild(title);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'grammar-corrector-modal-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', hideResultModal);
  header.appendChild(closeButton);
  
  // Add header to modal
  modal.appendChild(header);
  
  // Create modal content
  const content = document.createElement('div');
  content.className = 'grammar-corrector-modal-content';
  
  // Add textarea for corrected text
  const textarea = document.createElement('textarea');
  textarea.className = 'grammar-corrector-modal-textarea';
  textarea.readOnly = true;
  textarea.spellcheck = false; // Disable browser's spell checking
  content.appendChild(textarea);
  
  // Add copy button
  const copyButton = document.createElement('button');
  copyButton.className = 'grammar-corrector-modal-copy';
  copyButton.textContent = 'Copy';
  copyButton.addEventListener('click', () => {
    textarea.select();
    document.execCommand('copy');
    
    // Visual feedback
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 2000);
  });
  content.appendChild(copyButton);
  
  // Add content to modal
  modal.appendChild(content);
  
  // Add drag functionality to modal
  makeDraggable(modal, header);
  
  return {
    modal,
    textArea: textarea,
    copyButton
  };
};

// Make the modal draggable
function makeDraggable(modal, dragHandle) {
  let offsetX, offsetY, isDragging = false;
  
  dragHandle.style.cursor = 'move';
  
  dragHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    const modalRect = modal.getBoundingClientRect();
    
    // Calculate the offset of the mouse from the modal's top-left corner
    offsetX = e.clientX - modalRect.left;
    offsetY = e.clientY - modalRect.top;
    
    // Add an overlay to prevent unexpected interactions during drag
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'move';
    overlay.id = 'drag-overlay';
    document.body.appendChild(overlay);
    
    document.addEventListener('mousemove', moveModal);
    document.addEventListener('mouseup', stopDragging);
  });
  
  function moveModal(e) {
    if (!isDragging) return;
    
    // Calculate new position
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    // Check window boundaries
    const modalRect = modal.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Ensure modal stays within window boundaries
    const leftPos = Math.min(Math.max(0, x), windowWidth - modalRect.width);
    const topPos = Math.min(Math.max(0, y), windowHeight - modalRect.height);
    
    // Apply new position
    modal.style.left = leftPos + 'px';
    modal.style.top = topPos + 'px';
    modal.style.transform = 'none';
  }
  
  function stopDragging() {
    isDragging = false;
    document.removeEventListener('mousemove', moveModal);
    document.removeEventListener('mouseup', stopDragging);
    
    // Remove the overlay
    const overlay = document.getElementById('drag-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
}

// Main variables
let selectedText = '';
let selectedElement = null;
let isLoading = false;
let selectionRange = null;
let floatingButton = null;
let resultModalElements = null;
let buttonPosition = { top: 0, left: 0 };
let originalCaretPosition = 0;
let isButtonClicked = false;
let loadingElement = null;
let errorElement = null;

// Message handler for error recovery
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle background script responses
  if (request.action === 'checkConnection') {
    sendResponse({ connected: true });
  }
  return true; // Keep the message channel open for async responses
});

// Check connection to background script periodically
function checkExtensionConnection() {
  try {
    chrome.runtime.sendMessage({ action: 'checkConnection' }, response => {
      if (chrome.runtime.lastError) {
        console.log('Extension connection error:', chrome.runtime.lastError);
        // Connection error occurred, but we've handled it
      }
    });
  } catch (error) {
    console.log('Failed to check extension connection:', error);
  }
}

// Initialize floating button and styles
function initialize() {
  injectStyles();
  if (!floatingButton) {
    floatingButton = createFloatingButton();
    document.body.appendChild(floatingButton);
    
    // Event listener for the floating button
    floatingButton.addEventListener('click', () => {
      if (selectedText && !isLoading) {
        // Save the selection range before correcting
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          selectionRange = selection.getRangeAt(0).cloneRange();
        }
        correctGrammar();
        hideFloatingButton();
      }
    });
  }
  
  // Create the result modal but don't append yet
  if (!resultModalElements) {
    resultModalElements = createResultModal();
  }
  
  // Check connection every 30 seconds
  setInterval(checkExtensionConnection, 30000);
  
  console.log('Grammar corrector initialized');
}

// Run initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Monitor text selection changes (more reliable than mouseup alone)
document.addEventListener('selectionchange', () => {
  // Clear any existing timeout to prevent multiple calls
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  // Set a timeout to avoid performance issues with rapid selection changes
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 1) {
      // Store the element where text was selected
      selectedElement = selection.anchorNode.parentElement;
      
      // Store caret position for replacing text later
      originalCaretPosition = selection.anchorOffset;
      
      // Get the position for the floating button
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      
      // Show the floating button
      showFloatingButton(rect.left, rect.top);
    } else {
      // Don't hide if selection was just clicked
      if (!isButtonClicked) {
        hideFloatingButton();
      }
    }
  }, 200);
});

// Track if button was clicked
let selectionTimeout = null;

// Show floating button when text is selected (via mouse up event)
document.addEventListener('mouseup', (event) => {
  // Check if our button was clicked
  isButtonClicked = event.target === floatingButton;
  
  if (!isButtonClicked) {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 1) {
      // Show the corrector button
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      showFloatingButton(rect.left, rect.top);
    } else {
      // Don't hide immediately when selecting
      setTimeout(() => {
        const newSelection = window.getSelection();
        if (newSelection.toString().trim().length <= 1) {
          hideFloatingButton();
        }
      }, 300);
    }
  }
});

// Position and show the floating button near the selected text
function showFloatingButton(x, y) {
  if (!floatingButton) {
    return;
  }
  
  // Get the selection rectangle
  const selection = window.getSelection();
  let rect = selection.getRangeAt(0).getBoundingClientRect();
  
  // Calculate screen-relative position
  // Position the button above and centered to the selection
  const buttonWidth = 70; // Approximate width for smaller button
  const posX = window.scrollX + rect.left + (rect.width / 2) - (buttonWidth / 2);
  const posY = window.scrollY + rect.top - 30; // Closer to the selection
  
  // Update button position
  floatingButton.style.left = `${posX}px`;
  floatingButton.style.top = `${posY}px`;
  floatingButton.style.display = 'block';
  
  // Store position for potential error messages
  buttonPosition = { top: posY, left: posX };
  
  // Log position for debugging
  console.log(`Showing button at: ${posX}, ${posY}`);
}

// Hide the floating button
function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.style.display = 'none';
  }
}

// Function to show the result modal with corrected text
function showResultModal(correctedText) {
  console.log('Showing result modal with text:', correctedText);
  
  if (!resultModalElements) {
    console.log('Creating result modal');
    resultModalElements = createResultModal();
    document.body.appendChild(resultModalElements.modal);
  } else if (!resultModalElements.modal.parentElement) {
    console.log('Adding existing modal to document');
    document.body.appendChild(resultModalElements.modal);
  }
  
  // Set the corrected text
  resultModalElements.textArea.value = correctedText;
  
  // Adjust textarea height based on content
  adjustTextareaHeight(resultModalElements.textArea, correctedText);
  
  // Show the modal
  resultModalElements.modal.style.display = 'block';
  
  // Modify the selection behavior
  resultModalElements.textArea.addEventListener('mousedown', function(event) {
    // Prevent default selection behavior when clicking
    event.stopPropagation();
  });
  
  // Focus but don't select the full text automatically
  resultModalElements.textArea.focus();
  
  // Place cursor at the beginning
  resultModalElements.textArea.setSelectionRange(0, 0);
}

// Function to adjust textarea height based on content
function adjustTextareaHeight(textarea, text) {
  // Set the content to measure its actual height
  textarea.value = text;
  
  // Create a hidden textarea for measuring content height
  const clone = textarea.cloneNode(true);
  clone.style.visibility = 'hidden';
  clone.style.position = 'absolute';
  clone.style.height = 'auto'; // Let it expand naturally
  clone.style.width = '776px'; // 800px - paddings (24px)
  
  // Add to document to measure
  document.body.appendChild(clone);
  
  // Set to exact same content
  clone.value = text;
  
  // Measure the scrollHeight
  const requiredHeight = clone.scrollHeight;
  
  // Ensure minimum height of 60px
  const finalHeight = Math.max(requiredHeight, 60);
  
  // Set the height - we don't need to limit the maximum height
  // because we want the modal to expand as needed
  textarea.style.height = finalHeight + 'px';
  
  // Clean up
  document.body.removeChild(clone);
  
  console.log(`Adjusted modal height: ${finalHeight}px`);
}

// Hide the result modal
function hideResultModal() {
  if (resultModalElements) {
    resultModalElements.modal.style.display = 'none';
  }
}

// Function to handle grammar correction
function correctGrammar() {
  if (selectedText) {
    isLoading = true;
    showLoading();
    
    console.log('Sending text for grammar correction:', selectedText);
    
    chrome.runtime.sendMessage(
      { action: 'correctGrammar', text: selectedText },
      response => {
        console.log('Received response from background script:', response);
        isLoading = false;
        hideLoading();
        
        if (response && response.correctedText) {
          const correctedText = response.correctedText;
          console.log('Corrected text:', correctedText);
          
          // Show the corrected text in the result modal
          showResultModal(correctedText);
        } else if (response && response.error) {
          console.error('Grammar correction error:', response.error);
          
          // Show error message
          showError(response.error);
        } else {
          console.error('Unknown error during grammar correction');
          
          showError('An unknown error occurred. Please try again.');
        }
      }
    );
  } else {
    console.error('No text selected or no element found');
  }
}

// Create and show a loading indicator
function showLoading() {
  if (loadingElement) {
    return;
  }
  
  const loading = document.createElement('div');
  loading.className = 'grammar-corrector-loading';
  loading.textContent = 'Correcting...';
  document.body.appendChild(loading);
  
  loadingElement = loading;
}

// Function to show error message
function showError(message) {
  if (errorElement) {
    errorElement.remove();
  }
  
  const errorContainer = document.createElement('div');
  errorContainer.className = 'grammar-corrector-error';
  
  const errorMessage = document.createElement('div');
  errorMessage.innerHTML = `<strong>Error:</strong> ${message}`;
  errorContainer.appendChild(errorMessage);
  
  const closeButton = document.createElement('button');
  closeButton.className = 'grammar-corrector-error-button';
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', () => {
    errorContainer.remove();
    errorElement = null;
  });
  
  errorContainer.appendChild(closeButton);
  document.body.appendChild(errorContainer);
  
  errorElement = errorContainer;
  
  // Automatically remove after 10 seconds
  setTimeout(() => {
    if (errorElement === errorContainer) {
      errorContainer.remove();
      errorElement = null;
    }
  }, 10000);
}

// Function to hide loading state
function hideLoading() {
  console.log('Hiding loading state');
  if (loadingElement) {
    loadingElement.remove();
    loadingElement = null;
  }
}
