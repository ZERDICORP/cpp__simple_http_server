#include "http.h"

void HTTP::Server::_requestHandler(Request& req, Response& res)
{
	zer::File file;
	file.disableWarnings();

	std::string sPath = req.get("Path");

	if (sPath == "/")
		file.read("./static/index.html");
	else
	{
		file.open("./static" + sPath);

		if (!file.doesExists())
			return;

		std::string sType = this -> _getType(sPath);

		if (sType != this -> _mimeTypes["NULL_TYPE"])
		{
			if (sType == ".ico")
				file.read({zer::file::Modifier::binary});
			else
				file.read();

			res.set("Content-Type", this -> _mimeTypes[sType]);
		}
	}

	res.set("Content", file.data());
}

int main()
{
	HTTP::Server server("8080");
	server.run();

	system("pause > nul");
	return 0;
}