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


ZacDesklet.prototype =
{
	__proto__: Desklet.Desklet.prototype,

	_init: function(metadata, desklet_id)
	{
		Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

		this.settings = new Settings.DeskletSettings(this, metadata["uuid"], desklet_id);
		this.settings.bind("settingImage", "settingImage", this.onSettingImageChanged);
		this.settings.bind("settingKeepRatio", "settingKeepRatio", this.onSettingKeepRatioChanged);
		this.settings.bind("settingWidth", "settingWidth", this.onSettingGeometryChanged);
		this.settings.bind("settingHeight", "settingHeight", this.onSettingGeometryChanged);
		this.settings.bind("settingBorderResize", "settingBorderResize");

		this.window = new St.Bin({reactive: true});

		if (this.settingImage == "")
			this.settingImage = GLib.get_home_dir() + "/.local/share/cinnamon/desklets/" + metadata["uuid"] + '/image.jpg';
		this._clutterTexture = new Clutter.Texture();

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		this.onSettingImageChanged();
		this.onSettingGeometryChanged();
		//~ this.onSettingKeepRatioChanged();
		this._clutterTexture.set_keep_aspect_ratio(this.settingKeepRatio);
		this._clutterBox.add_actor(this._clutterTexture);

		this.text = new St.Label();
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


	onSettingImageChanged: function()
	{
		this._clutterTexture.set_from_file(this.settingImage);
	},


	onSettingGeometryChanged: function()
	{
		this._clutterBox.set_width(this.settingWidth);
		this._clutterBox.set_height(this.settingHeight);
	},


	onSettingKeepRatioChanged: function()
	{
		this._clutterTexture.set_keep_aspect_ratio(this.settingKeepRatio);
		if (this.settingKeepRatio)
			this.settingWidth = this._clutterTexture.get_width();
		this.settingHeight = this._clutterTexture.get_height();
		this.onSettingGeometryChanged();
	},


	adjustTextureSize: function()
	{
			this.settingWidth = this._clutterTexture.get_width();
			this.settingHeight = this._clutterTexture.get_height();
			this.onSettingGeometryChanged();
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
			this.adjustTextureSize();
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
			if (px > actor.width - this.settingBorderResize &&
					py > actor.height - this.settingBorderResize)
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
