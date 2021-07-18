#include "config.h"

void showInfoAtStart(std::string sInfo);

class ConfigManager
{
	public:
		ConfigManager(std::string sCfgName = ".cfg");
		
		std::map<std::string, std::string> params;
};