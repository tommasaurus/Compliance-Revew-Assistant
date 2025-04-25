# Compliance Copy Review Assistant

This front-end prototype assists compliance professionals in reviewing flagged language in marketing copy efficiently. Designed for high-frequency use (hundreds of reviews daily), it emphasizes speed, clarity, and minimal friction.

## Setup Instructions

To run locally:  
1. Install dependencies:  
   ```bash
   npm install
   ```  
2. Start the development server:  
   ```bash
   npm run dev
   ```  

View the deployed version here:  
[https://compliance-revew-assistant.vercel.app/](https://compliance-revew-assistant.vercel.app/)

## UX Decisions: Prioritizing Efficiency and Intuition

The tool’s design caters to compliance professionals needing to review and act on flagged text quickly. Below is an explanation of the design process, discarded alternatives, and the chosen approach.

### Initial Options and Why They Were Discarded

Several design ideas were considered but rejected due to inefficiencies:  
- **Inline Editing with Dropdowns**:  
  Dropdowns work for isolated edits but become clunky when violations are close together, risking overlapping UI elements and user frustration.  
- **Modal Popups**:  
  Modals disrupt workflow by obscuring the text and prevent simultaneous viewing of multiple violations, critical for context.  
- **Drag-and-Drop Suggestions**:  
  This was too slow and impractical for dense text, requiring precise movements that hinder rapid reviews.  
- **Visual Diff**:  
  Better suited for final comparisons than real-time decision-making, it didn’t fit the primary interaction flow.  

These were set aside for a solution that better supports speed and usability.

### Chosen Design: Hover Apply + Sidebar

The final design combines two complementary interaction patterns:  
1. **Hover for Speed**:  
   - Hovering over a highlighted violation displays a popover with three suggested replacements. Clicking a suggestion applies it instantly.  
   - **Reasoning**: Users naturally hover over items they want to inspect or edit. By showing suggestions on hover, the tool anticipates this action, enabling the most frequent task (accepting suggestions) with minimal effort.  

2. **Click for Flexibility via Sidebar**:  
   - On page load, the sidebar is open by default, listing all violations with severity (color-coded: red for high, orange for medium, yellow for low).  
   - Clicking a highlight or sidebar item selects the violation, opening a panel with detailed info and actions: accept a suggestion, dismiss (with a comment), or edit inline.  
   - **Reasoning**: The sidebar provides an overview and handles less common, detailed tasks without cluttering the text area. When closed, hover popovers maintain quick access to suggestions.  

This dual system—hover for rapid actions, click for deeper control—optimizes the workflow for both efficiency and flexibility.

### Supporting Features

- **Keyboard Shortcuts**:  
  - Arrow keys cycle through violations, Enter triggers inline editing or applies changes, and Escape closes the sidebar.  
  - These cater to power users, speeding up navigation and actions.  

- **Toast Notifications**:  
  - Brief confirmations appear after actions (e.g., accepting a suggestion), ensuring users know changes succeeded.  

- **Color-Coded Severity**:  
  - Highlights use red, orange, and yellow to indicate severity, helping users prioritize critical issues quickly.  

- **Key Guide**:  
  - A guide introduces shortcuts and hover functionality, making the tool intuitive for new users.  

### Design Rationale

- **User Behavior**:  
  Hovering and clicking are intuitive first steps for examining violations. The design leverages this to streamline actions.  
- **Balance**:  
  The open sidebar offers an immediate overview, while hover popovers keep quick edits accessible when it’s closed.  
- **Accessibility**:  
  Features like shortcuts and notifications support both novice and expert users, enhancing overall usability.

## Known Limitations

1. **Hover Discoverability**  
   - New users might not immediately notice the hover popover for quick actions (e.g., accepting suggestions). Additional onboarding cues or tooltips could improve discoverability for first-time users.

2. **No Edit Locking or Conflict Prevention**  
   - In a multi-user environment, there’s no mechanism to lock inline editing fields or prevent conflicts if multiple users edit the same document simultaneously. This could lead to overwritten changes or confusion in collaborative settings.

3. **Limited Undo Support**  
   - After making an inline edit or dismissing a suggestion, there’s no clear way to undo the action beyond manual retyping or reopening the sidebar. This increases the risk of errors, especially during rapid edits.

4. **No Bulk Dismissal or Acceptance**  
   - Users cannot select multiple violations (e.g., low-priority ones) and dismiss or accept them in bulk. Each violation requires individual interaction via the sidebar, which can be tedious for documents with many minor issues.

5. **Potential User Overwhelm from Sidebar and Key Guide**  
   - The always-open sidebar and the key guide, while helpful, might overwhelm new users with too much information at once. Streamlining or collapsing these elements by default could improve the initial user experience.

6. **Dismissal Friction**  
   - Requiring comments for dismissals adds an extra step that might slow users down, especially for frequent dismissals. Predefined comment options or a quicker dismissal flow could reduce this friction.