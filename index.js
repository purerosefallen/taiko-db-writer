const fs = require('fs');
//const sqlite3 = require('sqlite3').verbose();
//const iconv = require('iconv-lite');
//const convert = require('encoding').convert

const fpath = process.argv[2];

var all_songs = [];

const courseTypes = {
	"0": "easy",
	"1": "normal",
	"2": "hard",
	"3": "oni",
	"4": "ura",
	"edit": "ura"
}

function get_sql(song) { 
	return "INSERT INTO songs VALUES(" + song.song_id + ",'" + song.title + "',NULL," + (song.subtitle ? "'" + song.subtitle + "'" : "NULL") + ",NULL," + (song.difficulty.easy ? song.difficulty.easy : "NULL") + "," + (song.difficulty.normal ? song.difficulty.normal : "NULL") + "," + (song.difficulty.hard ? song.difficulty.hard : "NULL") + "," + (song.difficulty.oni ? song.difficulty.oni : "NULL") + "," + (song.difficulty.ura ? song.difficulty.ura : "NULL") + ",1," + song.category + ",'tja',-0.023,NULL," + (song.preview ? song.preview : "NULL") + ",NULL,NULL);";
}

//console.log("Reading: " + fpath);
const category_array = fs.readdirSync(fpath);

for (var category_raw of category_array) { 
	const category = parseInt(category_raw);
	if (isNaN(category))
		continue;
	const category_path = fpath + "/" + category;
	//console.log("Reading: " + category_path);
	const songs = fs.readdirSync(category_path);
	for (var song_raw of songs) { 
		const song_id = parseInt(song_raw);
		if (isNaN(song_id))
			continue;
		const tja_path = category_path + "/" + song_id + "/main.tja"
		//console.log("Reading: " + tja_path);
		const tja_text = fs.readFileSync(tja_path, { encoding: "utf8" })
		//var buf = Buffer.from(tja_base64, "base64");
		//var encoded_buf = convert(buf, "UTF-8", "SHIFT-JIS");
		//const tja_text = encoded_buf.toString('utf8');
		const tja_lines = tja_text.split("\n");
		var res = {
			difficulty: {
				easy: null,
				normal: null,
				hard: null,
				oni: null,
				ura: null,
			},
			song_id: song_id,
			category: category,
			preview: null,
			branch: {
				easy: false,
				normal: false,
				hard: false,
				oni: false,
				ura: false,
			}
		}
		var courseName = "oni";
		for (var line of tja_lines) { 
			const line_ = line.trim();
			if (line_.indexOf(":") > 0) { 
				//const line__ = convert(line_, "UTF-8", "SHIFT-JIS").toString('utf8');
				const temp = line_.split(":");
				const key = temp[0].toLowerCase();
				const value = temp[1];
				//console.log("Find value: " + key +" --> " + value);
				switch (key) {
					case "title":
						res.title = value.replace("'","''");
						break;
					case "subtitle":
						res.subtitle = value.replace("'","''");
						break;
					case "demostart":
						res.preview = value;
					case "course":
						const diff = value.toLowerCase();
						if(diff in courseTypes){
							courseName = courseTypes[diff];
						}else{
							courseName = diff;
						}
						break;
					case "level": 
						res.difficulty[courseName] = value;
						break;
				}
			} else if (line_.startsWith("#BRANCHSTART")) {
				res.branch[courseName] = true;
			}
		}
		for (var diff of ["easy", "normal", "hard", "oni", "ura"]) { 
			if (res.difficulty[diff]) { 
				if (res.branch[diff]) {
					res.difficulty[diff] = "'" + res.difficulty[diff] + " B'";
				} else { 
					res.difficulty[diff] = "'" + res.difficulty[diff] + "'";
				}
			}
		}
		all_songs.push(res);
	}
}

for (var song of all_songs) {
	console.log(get_sql(song));
}
