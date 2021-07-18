import sys, json, os
import zer_io

mDATABASE_PATH = "./db/portfolio.json";
mIMAGES_PATH = "./db/images/";

class command:
	add = ["-a", "-add"];
	delete = ["-d", "-del"];
	edit = ["-e", "-edit"];

def showTitle(title):
	line = f" {title} :";
	print("-" * len(line));
	print(line);
	print("-" * len(line), end="\n");

def getTopic(topics, value):
	if value.isdigit():
		return [(index, topic) for index, topic in enumerate(topics) if index == int(value)][0];
	else:
		return [(index, topic) for index, topic in enumerate(topics) if topic["name"] == value][0];

def getItem(items, value):
	if value.isdigit():
		return [(index, item) for index, item in enumerate(items) if index == int(value)][0];
	else:
		return [(index, item) for index, item in enumerate(items) if item["title"] == value][0];

def inputImagePrefix(inputText):
	imagePrefix = input(inputText);
	if imagePrefix:
		return [mIMAGES_PATH.replace("./", "/") + fileName for fileName in os.listdir(mIMAGES_PATH) if imagePrefix in fileName];
	else:
		return [];

def saveDatabase(db):
	json.dump(db, open(mDATABASE_PATH, "w"), sort_keys=True, indent=4);

def commandHandler(argv, topics):
	print("\n# Simple DBMS #\n");

	argvParts = argv[0].split(".");

	if len(argvParts) == 1:
		if len(argv) == 1:
			showTitle(f"{argvParts[0]}[...]");
			print("\n".join([f"{index}) {topic['name']}" for index, topic in enumerate(topics)]));
		else:
			showTitle(f"{argv[1]} | {argvParts[0]}[...]");
			if argv[1] in command.add:
				name = input(f"{argvParts[0]}.{{...}}.name: ");
				topics.append({
					"name": name,
					"icon": input(f"{argvParts[0]}.{{{name}}}.icon: "),
					"items": []
				});
				print(zer_io.jsonTPS(topics[len(topics) - 1]));
				saveDatabase(topics);
	elif len(argvParts) == 2:
		index, topic = getTopic(topics, argvParts[1]);
		dbPath = f"{argvParts[0]}.{{{topic['name']}}}";
		if len(argv) == 1:
			showTitle(dbPath);
			topic.update({"items": "[...]"});
			print(zer_io.jsonTPS(topic));
		else:
			showTitle(f"{argv[1]} | {dbPath}");
			if argv[1] in command.delete:
				del topics[index];
				print(zer_io.jsonTPS(topic));
				saveDatabase(topics);
	elif len(argvParts) == 3:
		index, topic = getTopic(topics, argvParts[1]);
		dbPath = f"{argvParts[0]}.{{{topic['name']}}}.{argvParts[2]}";
		if argvParts[2] == "items":
			if len(argv) == 1:
				showTitle(f"{dbPath}[...]");
				print("\n".join([f"{index}) {item['title']}" for index, item in enumerate(topic["items"])]));
			else:
				showTitle(f"{argv[1]} | {dbPath}[...]");
				if argv[1] in command.add:
					title = input(f"{dbPath}.{{...}}.title: ");
					newItem = {
						"title": title,
						"description": input(f"{dbPath}.{{{title}}}.description: "),
						"platform": input(f"{dbPath}.{{{title}}}.platform: "),
						"toolStack": input(f"{dbPath}.{{{title}}}.toolStack: "),
						"actionType": input(f"{dbPath}.{{{title}}}.actionType (get, open, download): "),
						"actionUrl": input(f"{dbPath}.{{{title}}}.actionUrl: "),
						"images": inputImagePrefix(f"{dbPath}.{{{title}}}.images (perfix): ")
					};
					topics[index]["items"].append(newItem);
					print(zer_io.jsonTPS(newItem));
					saveDatabase(topics);
		else:
			if len(argv) == 1:
				showTitle(dbPath);
				print(topic[argvParts[2]]);
			else:
				showTitle(f"{argv[1]} | {dbPath}");
				if argv[1] in command.edit:
					topics[index][argvParts[2]] = input(f"{dbPath}: ");
					print(zer_io.jsonTPS(topics[index]));
					saveDatabase(topics);
	elif len(argvParts) == 4:
		topicIndex, topic = getTopic(topics, argvParts[1]);
		itemIndex, item = getItem(topic["items"], argvParts[3]);
		dbPath = f"{argvParts[0]}.{{{topic['name']}}}.{argvParts[2]}.{{{item['title']}}}";
		if len(argv) == 1:
			showTitle(dbPath);
			print(zer_io.jsonTPS(item));
		else:
			showTitle(f"{argv[1]} | {dbPath}");
			if argv[1] in command.delete:
				del topics[topicIndex]["items"][itemIndex];
				print(zer_io.jsonTPS(item));
				saveDatabase(topics);
	elif len(argvParts) == 5:
		topicIndex, topic = getTopic(topics, argvParts[1]);
		itemIndex, item = getItem(topic["items"], argvParts[3]);
		dbPath = f"{argvParts[0]}.{{{topic['name']}}}.{argvParts[2]}.{{{item['title']}}}.{argvParts[4]}";
		if len(argv) == 1:
			showTitle(dbPath);
			if argvParts[4] == "images":
				print(zer_io.jsonTPS(item["images"]));
			else:
				print(item[argvParts[4]]);
		else:
			showTitle(f"{argv[1]} | {dbPath}");
			if argv[1] in command.edit:
				if argvParts[4] == "images":
					topics[topicIndex]["items"][itemIndex]["images"] = inputImagePrefix(f"{dbPath} (perfix): ");
				else:
					topics[topicIndex]["items"][itemIndex][argvParts[4]] = input(f"{dbPath}: ");
				print(zer_io.jsonTPS(topics[topicIndex]["items"][itemIndex]));
				saveDatabase(topics);
			elif argv[1] in command.delete:
				del topics[topicIndex]["items"][itemIndex][argvParts[4]];
				print(zer_io.jsonTPS(topics[topicIndex]["items"][itemIndex]));
				saveDatabase(topics);

if __name__ == '__main__':
	del sys.argv[0];
	commandHandler(sys.argv, json.load(open(mDATABASE_PATH)));