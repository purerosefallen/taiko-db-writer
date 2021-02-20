const fs = require('fs');
const crypto = require('crypto');
//const sqlite3 = require('sqlite3').verbose();
const iconv = require('iconv-lite');
//const convert = require('encoding').convert

const fpath = process.argv[2];

let all_songs = [];

const courseTypes = {
	"0": "easy",
	"1": "normal",
	"2": "hard",
	"3": "oni",
	"4": "ura",
	"edit": "ura"
}

async function main() {
	const category_array = await fs.promises.readdir(fpath);

	for (let category_raw of category_array) {
		const category = parseInt(category_raw);
		if (isNaN(category))
			continue;
		const category_path = fpath + "/" + category;
		//console.log("Reading: " + category_path);
		const songs = await fs.promises.readdir(category_path);
		for (let song_raw of songs) {
			const song_id = parseInt(song_raw);
			if (isNaN(song_id))
				continue;
			const tja_path = category_path + "/" + song_id + "/main.tja"
			//console.log("Reading: " + tja_path);
			const tja_buffer = await fs.promises.readFile(tja_path);
			let md5 = crypto.createHash('md5');
			md5.update(tja_buffer);
			const tja_hash = md5.digest("base64").replace(/=/g, "");
			const tja_text = iconv.decode(tja_buffer, "shift-jis")
			//let buf = Buffer.from(tja_base64, "base64");
			//let encoded_buf = convert(buf, "UTF-8", "SHIFT-JIS");
			//const tja_text = encoded_buf.toString('utf8');
			const tja_lines = tja_text.split("\n");
			let res = {
				skin_id: null,
				title: null,
				category_id: category,
				enabled: true,
				type: "tja",
				courses: {
					easy: null,
					normal: null,
					hard: null,
					oni: null,
					ura: null,
				},
				volume: 1,
				id: song_id,
				preview: null,
				order: song_id,
				title_lang: {
					ja: null,
					en: null,
					cn: null,
					tw: null,
					ko: null
				},
				hash: tja_hash,
				offset: process.env.OFFSET ? parseFloat(process.env.OFFSET) : -0.023,
				maker_id: process.env.MAKER ? parseFloat(process.env.MAKER) : null,
				subtitle: null,
				subtitle_lang: {
					ja: null,
					en: null,
					cn: null,
					tw: null,
					ko: null
				},
				lyrics: false
			}
			let courseName = "oni";
			for (let line of tja_lines) {
				const line_ = line.trim();
				if (line_.indexOf(":") > 0) {
					//const line__ = convert(line_, "UTF-8", "SHIFT-JIS").toString('utf8');
					const temp = line_.split(":");
					const key = temp[0].toLowerCase();
					const value = temp[1];
					//console.log("Find value: " + key +" --> " + value);
					switch (key) {
						case "title":
							res.title = value;
							break;
						case "subtitle":
							res.subtitle = value;
							break;
						case "demostart":
							res.preview = parseFloat(value);
						case "course":
							const diff = value.toLowerCase();
							if (diff in courseTypes) {
								courseName = courseTypes[diff];
							} else {
								courseName = diff;
							}
							break;
						case "level":
							res.courses[courseName] = {
								stars: parseInt(value),
								branch: false
							};
							break;
					}
				} else if (line_.startsWith("#BRANCHSTART")) {
					res.courses[courseName].branch = true;
				}
			}
			all_songs.push(res);
		}
	}
	for (let song of all_songs) {
		console.log(JSON.stringify(song));
	}
}

main();
