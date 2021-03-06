const Desklet = imports.ui.desklet;
const Settings = imports.ui.settings;

const Lang = imports.lang;
//~ const Mainloop = imports.mainloop;

//~ const Cinnamon = imports.gi.Cinnamon;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const ClutterGst = imports.gi.ClutterGst;
const GLib = imports.gi.GLib;
const Gst = imports.gi.Gst;
//~ const GObject = imports.gi.GObject;


function ZacDesklet(metadata, desklet_id)
{
	this._init(metadata, desklet_id);
}


ZacDesklet.prototype =
{
	__proto__: Desklet.Desklet.prototype,

	_init: function(metadata, desklet_id)
	{
		Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

		//~ Clutter.threads_init();
		//~ Clutter.init(null);
		//~ GObject.threads_init();
		ClutterGst.init(null, null);
		Gst.init(null);

		this.settings = new Settings.DeskletSettings(this, metadata["uuid"], desklet_id);
		this.settings.bind("settingStream", "settingStream", this.onSettingStreamChanged);
		this.settings.bind("settingPlayOnStart", "settingPlayOnStart");

		// main container for the desklet
		this.window = new St.Bin({reactive: true});

		let imgFilename = GLib.get_home_dir() + "/.local/share/cinnamon/desklets/" + metadata["uuid"] + '/icon.png';
		this._clutterTexture = new Clutter.Texture({keep_aspect_ratio: true});
		this._clutterTexture.set_from_file(imgFilename)

		//~ this.player = new ClutterGst.Playback();
		//~ this._content = new ClutterGst.Aspectratio(); // ClutterGst.Content - cannot convert to ClutterActor
		//~ this._content.set_player(this.player);

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		this._clutterBox.set_width(this.metadata["width"]);
		this._clutterBox.add_actor(this._clutterTexture);
		//~ this._clutterBox.set_content(this._content);

		//~ this.text = new St.Label();
		//~ this.text.set_text("Debug label");
		//~ this._clutterBox.add_actor(this.text);

		this.window.add_actor(this._clutterBox);

		this.button = new St.Button();
		this._clutterBox.add_actor(this.button);

		this.player = new ClutterGst.Playback();
		this.onSettingStreamChanged();

		this.isPlaying = this.settingPlayOnStart;
		this.setPlaying();

		this.buttonPressEventId = this.button.connect("clicked", Lang.bind(this, this.onButtonPressEvent));
		//~ this.motionEventId = this.window.connect("motion-event", Lang.bind(this, this.onMotionEvent));
		//~ this.timeout = Mainloop.timeout_add_seconds(5, Lang.bind(this, this.checkPlayStatus));
		this.setContent(this.window);
	},


	onSettingStreamChanged: function()
	{
		this.player.set_uri(this.settingStream);
	},


	onButtonPressEvent: function(actor, event)
	{
		this.isPlaying = !this.isPlaying;
		this.setPlaying();
		return true;
	},


	setPlaying: function()
	{
		this.player.set_playing(this.isPlaying);
		if (this.isPlaying)
			this.button.set_label('\u25b6');
		else
			this.button.set_label('\u25ae\u25ae');
	},


	//~ onMotionEvent: function(actor, event)
	//~ {
		//~ this.button.set_label('');
		//~ this.text.set_text(this.player.get_idle()+"_"+this.player.get_playing ()+"\n"
		//~ );
	//~ },


	checkPlayStatus: function()
	{
		//~ if (this.player.get_idle())
		//~ {
			//~ this.player.set_playing(false);
			//~ this.button.set_label('\u2297');
			//~ if (this.isPlaying)
				//~ setPlaying(); // retry
		//~ }
		//~ return true;
	},


	on_desklet_removed: function()
	{
		this.player.set_playing(false);
		Mainloop.source_remove(this.timeout);
	}

}

function main(metadata, desklet_id)
{
	return new ZacDesklet(metadata, desklet_id);
}
