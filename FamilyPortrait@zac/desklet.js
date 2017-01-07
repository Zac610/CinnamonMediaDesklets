const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;

const DEFAULT_WIDTH = 100;

function VideoDesk(metadata, desklet_id)
{
	this._init(metadata, desklet_id);
}

function getDefaulImagesDir()
{
	return "/home/zac/Documenti/Immagini/"
}

VideoDesk.prototype =
{
	__proto__: Desklet.Desklet.prototype,

	_init: function(metadata, desklet_id)
	{
		Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

		this.window = new St.Bin();

		let imgFilename = getDefaulImagesDir() + 'image.jpg';
		this._clutterTexture = new Clutter.Texture({keep_aspect_ratio: true});
		this._clutterTexture.set_from_file(imgFilename)

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		//~ this._clutterBox.set_width(this.metadata["width"]);
		this._clutterBox.set_width(DEFAULT_WIDTH);
		this._clutterBox.add_actor(this._clutterTexture);
		this.window.add_actor(this._clutterBox);

		this.setContent(this.window);
	}
}

function main(metadata, desklet_id)
{
	return new VideoDesk(metadata, desklet_id);
}
