const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const DEFAULT_WIDTH = 100;

function VideoDesk(metadata, desklet_id)
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


VideoDesk.prototype =
{
	__proto__: Desklet.Desklet.prototype,

	_init: function(metadata, desklet_id)
	{
		Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

		this.window = new St.Bin();

		let imgFilename = getUserImagesDir() + '/image.jpg';
		this._clutterTexture = new Clutter.Texture({keep_aspect_ratio: true});
		this._clutterTexture.set_from_file(imgFilename)

		this._clutterBox = new Clutter.Box();
		this._binLayout = new Clutter.BinLayout();
		this._clutterBox.set_layout_manager(this._binLayout);
		//~ this._clutterBox.set_width(this.metadata["width"]);
		this._clutterBox.set_width(DEFAULT_WIDTH);
		this._clutterBox.add_actor(this._clutterTexture);

		// Aggiunge un testo se serve
		this.text = new St.Label();
		this.text.set_text("desklet id: "+ desklet_id);
		this._clutterBox.add_actor(this.text);

		this.window.add_actor(this._clutterBox);
		//~ global.set_user_resizable(true);

		this.setContent(this.window);
	}
}


function main(metadata, desklet_id)
{
	return new VideoDesk(metadata, desklet_id);
}
