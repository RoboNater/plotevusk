# Issues and Notes from Testing

## Phase 3

### Overall

Everything worked pretty well, with only a few issues noted.  The development and test teams are extremely pleased with how well this worked on the first iteration.

### Issues Noted

1. Had one instance of a plot not working but was unable to repeat. The very first time a chart was requested, the chart pane opened but the plot was missing. All subsequent requests worked fine. Tried completely exiting VS Code and trying again, and in this case it worked fine.  

2. Color themes work correctly but plots that were already created before the color theme was switched sometimes end up being illegible or hard to read when the color theme switches from dark to light or from light to dark. This was mainly the font used for axis labels, perhaps a few other things.  The plot box and plot lines were all legible and responded correctly to color theme switches.

## Phase 4 & Phase 5

### Overall

Works well, looks great!  Very pleased with how this is turning out.

### Test Step Results

All test steps were executed.  All test steps passed except for the following:

- 4. Context Menu UI Presence
  - Failed: "Menu item is near the top of the menu" - It is at the bottom of the menu, but is still fully functional.

### Issues Noted

1. As noted after phase 3 testing, not all parts of existing plots update when the color theme is changed.  All text (title, axes labels, and tic labels) stay the same color.

2. When using the VS Code "Split" capability on a plot (e.g. Right Click on an existing Plot Tab and select Split Right), a new panel is created but the plot does not populate in the new panel.  The "Move" capability does work.

### Other notes and areas for improvement

1. Each plot is created in its own VS Code panel.  It would be better to only create a new panel if a plot panel does not exist already, and otherwise to plot to the existing panel or most recently used panel. Then the user can manage the plots and panels using standard VS Code tab-management functionality such as split, move, or drag-and-drop.

2. The right-click context menu item "Plot Variable" does not have an icon. This seems okay as the other context menu items do not have icons either. The only reason it is mentioned here is that Test 4 hints at an icon with "Menu item shows correct text and icon (if any)".
