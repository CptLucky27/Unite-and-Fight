// Define the clickable tile
class CharacterSelectTile extends Drawing {
  static get layer() {
    return "drawings";
  }

  static get shape() {
    return "rect";
  }

  static get colors() {
    return {
      fill: "#ff0000",
      stroke: "#000000",
      alpha: 0.5
    };
  }

  static get dimensions() {
    return {
      width: 100,
      height: 100
    };
  }

  static get clickLeft() {
    return (event) => {
      event.stopPropagation();
      const folderOptions = game.actors.entities.filter(entity => entity.data.type === "folder").map(entity => ({id: entity.id, name: entity.name}));
      new CharacterSelectForm(folderOptions).render(true);
    };
  }
}

// Define the character select form
class CharacterSelectForm extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["sheet"],
      template: "modules/unite-and-fight/templates/character-select-form.html",
      width: 400,
      height: 300,
      resizable: true,
      title: "Character Select"
    });
  }

  constructor(folderOptions) {
    super();
    this.folderOptions = folderOptions;
  }

  get templateData() {
    return {
      folderOptions: this.folderOptions
    };
  }

  async _updateObject(event, formData) {
    const folderId = formData.folder;
    const folder = game.actors.get(folderId);
    const actorIds = folder.content.map(actorId => folder.getEmbeddedEntity("Actor", actorId)._id);

    for (const actorId of actorIds) {
      const actor = game.actors.get(actorId);
      const newActorData = duplicate(actor.data);
      newActorData._id = null;
      newActorData.permission.default = 2;
      const newActor = await Actor.create(newActorData);
      newActor.update({
        "folder": folderId
      });
      ui.notifications.notify(`${newActor.name} created and permissions granted.`);
    }
  }
}

Hooks.on("canvasReady", () => {
  const characterSelectTile = new CharacterSelectTile({
    author: game.user._id,
    x: 100,
    y: 100,
    width: CharacterSelectTile.dimensions.width,
    height: CharacterSelectTile.dimensions.height,
    fillAlpha: CharacterSelectTile.colors.alpha,
    fillColor: CharacterSelectTile.colors.fill,
    strokeAlpha: CharacterSelectTile.colors.alpha,
    strokeColor: CharacterSelectTile.colors.stroke,
    rotation: 0,
    hidden: false,
    locked: false,
    z: 100,
    flags: {},
    texture: ""
  });
  canvas.drawingsLayer.addChild(characterSelectTile);
});

// Register the module
Hooks.once("init", () => {
  game.settings.register("unite-and-fight", "initialized", {
    name: "Unite and Fight module initialized",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });

  if (!game.settings.get("unite-and-fight", "initialized")) {
    game.settings.set("unite-and-fight", "initialized", true);
    ui.notifications.notify("Unite and Fight module initialized.");
  }

  game.packs.add("unite-and-fight.actors");
});

// Load templates
Hooks.once("ready", async () => {
  const templatePaths = [
    "modules/unite-and-fight/templates/character-select-form.html"
  ];

  const
