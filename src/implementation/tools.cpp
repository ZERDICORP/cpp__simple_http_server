#include "tools.h"

void showInfoAtStart(std::string sInfo)
{
	std::string sFillLine(sInfo.size() + 6, '#');
	std::string sBlankLine(sInfo.size() + 4, ' ');

	std::cout << sFillLine << std::endl;
	
	std::cout << "#" << sBlankLine << "#" << std::endl;
	std::cout << "#  " << sInfo << "  #" << std::endl;
	std::cout << "#" << sBlankLine << "#" << std::endl;
	std::cout << sFillLine << std::endl << std::endl;
}

ConfigManager::ConfigManager(std::string sCfgName)
{
	zer::File file(sCfgName);
	file.read({zer::file::Modifier::lines});

	for (int i = 0; i < file.linesLen(); ++i)
	{
		std::vector<std::string> rLine = zer::athm::split(file.lineAt(i), "=");
		this -> params[rLine[0]] = rLine[1];
	}
}