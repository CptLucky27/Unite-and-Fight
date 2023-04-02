class UniteAndFightCanvasLayer extends CanvasLayer {
  constructor() {
    super();
  }

  async _onClick(event) {
    // Check if the event is a left-click
    if (event.button !== 0) return;

    // Get the position of the click on the canvas
    const position = event.data.getLocalPosition(this);

    // Check if the click is within a drawing
    const drawing = this._getDrawingAtPosition(position);
    if (!drawing) return;

    // Get the character selection form
    const formData = await this._getCharacterSelectionForm();
    if (!formData) return;

    // Create a copy of the selected character and assign it to the player
    const actor = await this._copyCharacter(formData.characterId);
    game.user.assignHotbarMacro(actor);

    // Show a confirmation message to the player
    ui.notifications.info(`You have selected character "${actor.name}"`);

    // Remove the drawing from the canvas
    drawing.delete();
  }

  _getDrawingAtPosition(position) {
    // Iterate over the canvas drawings and check if the position is within a drawing
    for (const drawing of canvas.drawings.placeables) {
      if (drawing.contains(position.x, position.y)) {
        return drawing;
      }
    }
    return null;
  }

  async _getCharacterSelectionForm() {
    // Get a list of all the characters the player has access to
    const characters = game.actors.filter(actor => actor.hasPerm(game.user, "OWNER"));

    // Create a form for selecting a character
    const formData = {
      characterId: {
        label: "Select a character:",
        options: {}
      }
    };
    for (const character of characters) {
      formData.characterId.options[character.id] = character.name;
    }

    // Show the form to the player and wait for them to submit it
    const form = await new Promise(resolve => {
      new Dialog({
        title: "Select a Character",
        content: `<form>${renderFormFields(formData)}</form>`,
        buttons: {
          submit: {
            label: "Select",
            callback: (html) => {
              const formValues = validateFormValues(html.find("form")[0]);
              resolve(formValues);
            }
          },
          cancel: {
            label: "Cancel"
          }
        }
      }).render(true);
    });

    return form;
  }

  async _copyCharacter(characterId) {
    // Get the character data
    const character = game.actors.get(characterId);
    const characterData = duplicate(character.data);

    // Set the new owner to the current user
    characterData.permission[game.user.id] = 3;

    // Create a new actor from the character data
    const actor = await Actor.create(characterData);

    return actor;
  }
}

Hooks.on("canvasInit", () => {
  const canvasLayer = new UniteAndFightCanvasLayer();
  canvas.layers.floors.addChild(canvasLayer);
});
