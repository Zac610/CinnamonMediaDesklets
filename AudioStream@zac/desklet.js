const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const ClutterGst = imports.gi.ClutterGst;
const GLib = imports.gi.GLib;

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

		// main container for the desklet
		this.window = new St.Bin();

		//~ let imgFilename = '/home/zac/Progetti/ZacDesklet/image.png';
		let imgFilename = GLib.get_home_dir() + "/.local/share/cinnamon/desklets/" + metadata["uuid"] + '/icon.png';
		this._clutterTexture = new Clutter.Texture({keep_aspect_ratio: true});
		this._clutterTexture.set_from_file(imgFilename)

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		this._clutterBox.set_width(this.metadata["width"]);
		this._clutterBox.add_actor(this._clutterTexture);
		this.window.add_actor(this._clutterBox);

		this.player = new ClutterGst.Playback();
		this.player.set_uri("http://remix.kwed.org/download.php/5592/Slaygon%20-%20Nine%20Lives.mp3");

		this.player.set_playing(true);
		//this._clutterMedia = new Clutter.Media();

		//~ this.window.add_actor(this.text);
		this.setContent(this.window);
	},


	on_desklet_removed: function()
	{
		this.player.set_playing(false);
	}

}

function main(metadata, desklet_id)
{
	return new ZacDesklet(metadata, desklet_id);
}
