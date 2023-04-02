Hooks.on('renderDrawingConfig', (app, html, data) => {
  const buttons = $('<div class="form-group"></div>');
  const charSelect = $('<select class="character-select"></select>');
  charSelect.append($('<option value="" selected>Select a character...</option>'));
  game.actors.entities.forEach(actor => {
    if (actor.data.type === "character") {
      charSelect.append($('<option></option>').val(actor.id).html(actor.data.name));
    }
  });
  buttons.append(charSelect);
  html.find('.tab').last().after($('<div class="tab" data-tab="unite-and-fight"></div>').append(buttons));
  html.find('.tab[data-tab="unite-and-fight"]').hide();

  const tabButton = $(`<a class="item" data-tab="unite-and-fight"><i class="fas fa-users"></i> Unite and Fight</a>`);
  const tabs = html.find('.tabs');
  tabs.append(tabButton);

  tabButton.click(() => {
    tabs.find('.item').removeClass('active');
    tabButton.addClass('active');
    html.find('.tab').hide();
    html.find('.tab[data-tab="unite-and-fight"]').show();
  });

  html.find('form').submit(event => {
    event.preventDefault();
    const charId = charSelect.val();
    if (!charId) {
      ui.notifications.error('You must select a character.');
      return;
    }
    const drawingId = data.object._id;
    const message = {
      type: 'copy-character',
      data: {
        drawingId: drawingId,
        characterId: charId
      }
    };
    game.socket.emit('module.unite-and-fight', message);
    app.close();
  });
});

Hooks.on('socketlib.ready', () => {
  game.socket.on('module.unite-and-fight.copy-character', data => {
    const drawing = canvas.getLayer(data.drawingId);
    const character = game.actors.get(data.characterId);
    const duplicate = character.clone({temporary: true});
    duplicate.owner = drawing.data.author;
    canvas.scene.createEmbeddedDocuments('Actor', [duplicate.data], {parent: drawing});
    ui.notifications.info(`${character.data.name} copied to ${drawing.name}.`);
  });
});
