var win = nw.Window.get();



win.on('close', function () {
  	//this.minimize();
  	win.hide();
});

var tray = new nw.Tray({ title: 'Tray', tooltip: 'Fantastic Contraption Companion', icon: 'src/fcc_tray.png' });

tray.on('click', function(){
	win.show();
})

// Give it a menu
var menu = new nw.Menu();
menu.append(new nw.MenuItem({ label: 'Show Main Window', click: function(){win.show();} }));
menu.append(new nw.MenuItem({ label: 'Exit', click: function(){nw.App.quit(); win.close(true);} }));
tray.menu = menu;

let app = nw;

console.log(app);