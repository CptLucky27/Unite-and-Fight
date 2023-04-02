Hooks.on("renderSidebarTab", (app, html) => {
  if (app.options.id !== "actors") return;
  // Create a new button
  let button = $(`<button class="select-character">Select Character</button>`);
  html.find(".directory-footer").append(button);

  // Add a click event handler to the button
  button.click(() => {
    // Show the Actor Directory
    const directory = game.actors.directory;
    if (directory) directory.render(true);

    // Add a handler for actor selection
    const onActorSelect = (actor) => {
      // Copy the actor with full access
      let permissions = duplicate(actor.data.permission);
      permissions.default = 2;
      const newActor = actor.clone({ createDocuments: false, permissions });

      // Show the new actor sheet
      newActor.sheet.render(true);
    };

    // Show the Actor Directory with the onActorSelect handler
    directory.selectActor({ onActorSelect });
  });
});
