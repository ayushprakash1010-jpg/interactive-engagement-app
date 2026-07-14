/**
 * Pulse for Google Slides - Workspace Add-on
 * 
 * This script runs inside Google Slides and creates a sidebar that loads
 * the Pulse web app via an iframe.
 */

// Runs when the Google Slide is opened
function onOpen() {
  SlidesApp.getUi()
      .createAddonMenu()
      .addItem('Open Pulse', 'showSidebar')
      .addToUi();
}

// Opens the sidebar
function showSidebar() {
  // Get the ID of the current presentation
  var presentationId = SlidesApp.getActivePresentation().getId();
  
  // Create an HTML template from Sidebar.html
  var template = HtmlService.createTemplateFromFile('Sidebar');
  template.presentationId = presentationId;
  
  // Evaluate the template and set sidebar title
  var html = template.evaluate()
      .setTitle('Pulse for Google Slides')
      .setWidth(300);
      
  SlidesApp.getUi().showSidebar(html);
}
