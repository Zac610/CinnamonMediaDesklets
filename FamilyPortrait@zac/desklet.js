const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Signals = imports.signals;
const Cinnamon = imports.gi.Cinnamon;
const Settings = imports.ui.settings;


function ZacDesklet(metadata, desklet_id)
{
	this._init(metadata, desklet_id);
}


function getUserImagesDir() { // from fileUtils.js
    // Didn't find a function returning the user dirs, so parsing the user-dirs.dirs file to get it
    let userdirsFile = Gio.file_new_for_path(GLib.get_home_dir()+"/.config/user-dirs.dirs");
    let path;
    if (userdirsFile.query_exists(null)){
        try{
            let data = userdirsFile.load_contents(null);
            let dataDic = new Array();
            let lines = data[1].toString().split("\n");
            for (var i in lines){
                if (lines[i][0]=="#") continue;
                let line = lines[i].split("=", 2);
                if (line.length==2){
                    dataDic[line[0]] = line[1];
                }
            }
            if (dataDic["XDG_PICTURES_DIR"])
                path = dataDic["XDG_PICTURES_DIR"].substring(1, dataDic["XDG_PICTURES_DIR"].length-1).replace("$HOME", GLib.get_home_dir());
            else
                path = GLib.get_home_dir() + '/Images';
        }catch(e){
            path = GLib.get_home_dir() + '/Images';
        }
    }else path = GLib.get_home_dir() + '/Images';
    let file = Gio.file_new_for_path(path);
    if (file.query_exists(null)) return path;
    else return null;
}


ZacDesklet.prototype =
{
	__proto__: Desklet.Desklet.prototype,

	_init: function(metadata, desklet_id)
	{
		Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

		this.settings = new Settings.DeskletSettings(this, "FamilyPortrait@zac", desklet_id);
		this.settings.bindProperty(Settings.BindingDirection.IN, "settingKeepRatio", "settingKeepRatio",
                           this.onSettingKeepRatioChanged, null);
		this.settings.bindProperty(Settings.BindingDirection.IN, "settingWidth", "settingWidth",
                           this.onSettingGeometryChanged, null);
		this.settings.bindProperty(Settings.BindingDirection.IN, "settingHeight", "settingHeight",
                           this.onSettingGeometryChanged, null);
		this.settings.bindProperty(Settings.BindingDirection.IN, "settingBorderResize", "settingBorderResize",
                           null, null);

		this.window = new St.Bin({reactive: true});

		let imgFilename = getUserImagesDir() + '/image.jpg';
		this._clutterTexture = new Clutter.Texture();
		this.onSettingKeepRatioChanged();
		this._clutterTexture.set_from_file(imgFilename)

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		this.onSettingGeometryChanged();
		this._clutterBox.add_actor(this._clutterTexture);

		// Aggiunge un testo se serve
		this.text = new St.Label();
		//~ this.text.set_text("desklet id: "+ desklet_id);
		this._clutterBox.add_actor(this.text);

		this.window.add_actor(this._clutterBox);

		this._resizeAllowed = false;
		this.motionEventId = this.window.connect("motion-event", Lang.bind(this, this.onMotionEvent));
		this.leaveEventId = this.window.connect("leave-event", Lang.bind(this, this.onLeaveEvent));
		this._resizeInProgress = false;
		this.buttonPressEventId = this.window.connect("button-press-event", Lang.bind(this, this.onButtonPressEvent));
		this.buttonReleaseEventId = this.window.connect("button-release-event", Lang.bind(this, this.onButtonReleaseEvent));

		this.setContent(this.window);
	},


	onSettingGeometryChanged: function()
	{
		this._clutterBox.set_width(this.settingWidth);
		this._clutterBox.set_height(this.settingHeight);
	},

	onSettingKeepRatioChanged: function()
	{
		this._clutterTexture.set_keep_aspect_ratio(this.settingKeepRatio);
	},


	onButtonPressEvent: function(actor, event)
	{
		if (this._resizeAllowed == true)
		{
			this._resizeInProgress = true;
			return true;
		}
		else
			return false;
	},


	onButtonReleaseEvent: function(actor, event)
	{
		if (this._resizeInProgress == true)
		{
			this._resizeInProgress = false;
			return true;
		}
		else
			return false;
	},


	onMotionEvent: function(actor, event)
	{
		let [mx, my] = event.get_coords();
		let [ret, px, py] = actor.transform_stage_point(mx, my);

		if (this._resizeInProgress)
		{
			this._clutterBox.width = px + this.settingBorderResize;
			this._clutterBox.height = py + this.settingBorderResize;
		}
		else
		{
			if (px > actor.width - this.settingBorderResize && py > actor.height - this.settingBorderResize)
			{
				global.set_cursor(Cinnamon.Cursor.DND_MOVE);
				this._cursorChanged = true;
				this.text.set_text("resize");
				this._resizeAllowed = true;
			}
			else
			{
				global.unset_cursor();
				this._cursorChanged = false;
				this.text.set_text("");
				this._resizeAllowed = false;
			}
		}
  },


	onLeaveEvent: function(actor, event)
	{
		global.unset_cursor();
		this._cursorChanged = false;
		this.text.set_text("");
		this._resizeAllowed = false;
		this._resizeInProgress = false;
	},


	on_desklet_removed: function()
	{
		this.window.disconnect(this.motionEventId);
		this.window.disconnect(this.leaveEventId);
		this.window.disconnect(this.buttonPressEventId);
		this.window.disconnect(this.buttonReleaseEventId);
	}

}


function main(metadata, desklet_id)
{
	return new ZacDesklet(metadata, desklet_id);
}
