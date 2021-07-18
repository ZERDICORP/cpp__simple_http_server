#include "config.h"

#define mServerLog(sLogMessage) (std::cout << sLogMessage << std::endl)

class Server
{
	private:
		WSADATA _wsaData;
		
		SOCKET _socketListen = INVALID_SOCKET;
		
		bool _bDebugMode = false;
		bool _bWsaInit = false;
		bool _bServerWorking = true;
		
		std::string _sPort;

		std::map<std::string, std::string> _mimeTypes = {
			{".exe", "application/octet-binary"},
			{".zip", "application/zip"},
			{".json", "application/json"},
			{".css", "text/css"},
			{".png", "image/png"},
			{".pdf", "application/pdf"},
			{".js", "text/javascript"},
			{"NULL_TYPE", ""}
		};

		std::string _getType(std::string sPath);
		std::string _makeFileInfoJson(int iSlicesLen, int iSize, std::string sType);

		void _requestHandler(Request& req, Response& res);
		void _forceExit(std::string sError);
		void _doIfDebugModeEnable(auto callback) {if (this -> _bDebugMode) callback();}

		int _initListenSocket();

	public:
		Server() {}
		Server(std::string sPort) {this -> _sPort = sPort;}
		~Server() {if (this -> _bWsaInit) WSACleanup();}

		void enableDebugMode() {this -> _bDebugMode = true;}
		void run();
};