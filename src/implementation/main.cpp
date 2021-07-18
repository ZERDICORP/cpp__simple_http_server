#include "server.h"
#include "tools.h"

int main()
{
	setlocale(LC_ALL, "rus");

	ConfigManager cfg;

	if (cfg.params.find("INFO_AT_START") != cfg.params.end())
		showInfoAtStart(cfg.params["INFO_AT_START"]);

	Server server(cfg.params["PORT"]);
	server.run();

	system("pause > nul");
	return 0;
}