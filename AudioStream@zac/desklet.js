const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const ClutterGst = imports.gi.ClutterGst;
const GLib = imports.gi.GLib;
const Settings = imports.ui.settings;
const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;

ClutterGst.init(null, null);

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

		this.settings = new Settings.DeskletSettings(this, metadata["uuid"], desklet_id);
		this.settings.bind("settingStream", "settingStream", this.onSettingStreamChanged);
		this.settings.bind("settingPlayOnStart", "settingPlayOnStart");

		// main container for the desklet
		this.window = new St.Bin({reactive: true});

		let imgFilename = GLib.get_home_dir() + "/.local/share/cinnamon/desklets/" + metadata["uuid"] + '/icon.png';
		this._clutterTexture = new Clutter.Texture({keep_aspect_ratio: true});
		this._clutterTexture.set_from_file(imgFilename)

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		this._clutterBox.set_width(this.metadata["width"]);
		this._clutterBox.add_actor(this._clutterTexture);
		this.window.add_actor(this._clutterBox);

		this.text = new St.Label();
		this._clutterBox.add_actor(this.text);

		this.player = new ClutterGst.Playback();
		this.onSettingStreamChanged();

		this.isPlaying = this.settingPlayOnStart;
		this.setPlaying();

		this.motionEventId = this.window.connect("motion-event", Lang.bind(this, this.onMotionEvent));
		this.leaveEventId = this.window.connect("leave-event", Lang.bind(this, this.onLeaveEvent));
		this.buttonPressEventId = this.window.connect("button-press-event", Lang.bind(this, this.onButtonPressEvent));

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
			this.text.set_text("play");
		else
			this.text.set_text("pause");
	},


	onMotionEvent: function(actor, event)
	{
		let box_size = 30;
		let [mx, my] = event.get_coords();
		let [ret, px, py] = actor.transform_stage_point(mx, my);
		let xMin = actor.width / 2 - box_size/2;
		let xMax = actor.width / 2 + box_size/2;
		let yMin = actor.height / 2 - box_size/2;
		let yMax = actor.height / 2 + box_size/2;

			if (px > xMin && px < xMax && py > yMin && py < yMax)
			{
				if (this.isPlaying)
					global.set_cursor(Cinnamon.Cursor.DND_UNSUPPORTED_TARGET);
				else
					global.set_cursor(Cinnamon.Cursor.RESIZE_RIGHT);
			}
			else
			{
				global.unset_cursor();
		}
  },


	onLeaveEvent: function(actor, event)
	{
		global.unset_cursor();
	},

	on_desklet_removed: function()
	{
		this.player.set_playing(false);
		this.window.disconnect(this.motionEventId);
		this.window.disconnect(this.leaveEventId);
		this.window.disconnect(this.buttonPressEventId);

	}

}

function main(metadata, desklet_id)
{
	return new ZacDesklet(metadata, desklet_id);
}
