#undef UNICODE

#define WIN32_LEAN_AND_MEAN
#define FD_SETSIZE 1024

#include <ws2tcpip.h>
#include <errno.h>
#include <iostream>
#include <map>
#include <vector>
#include <locale.h>
#include <athm.h>
#include <file.h>

#ifndef ZER__HTTP_MODEL
	#define ZER__HTTP_MODEL
	#define mServerLog(sLogMessage) (std::cout << sLogMessage << std::endl)

	namespace HTTP
	{
		class Response
		{
			private:
				std::map<std::string, std::string> _data;

			public:
				Response();
				
				std::string make();

				void set(std::string sKey, std::string sValue) {this -> _data[sKey] = sValue;};
		};

		class Request
		{
			private:
				std::map<std::string, std::string> _data;

			public:
				bool hasHeader(std::string sHeader) {return this -> _data.find(sHeader) != this -> _data.end();}
				
				std::string const& get(std::string sKey) {return this -> _data[sKey];}

				void parse(std::string sData);
		};

		class Server
		{
			private:
				WSADATA _wsaData;
				
				SOCKET _socketListen = INVALID_SOCKET;
				
				bool _bConnectionLog = false;
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
					{".ico", "image/x-icon"},
					{"NULL_TYPE", ""}
				};

				std::string _getType(std::string sPath);
				std::string _makeFileInfoJson(int iSlicesLen, int iSize, std::string sType);

				void _requestHandler(Request& req, Response& res);
				void _forceExit(std::string sError);

				int _initListenSocket();

			public:
				Server() {}
				Server(std::string sPort) {this -> _sPort = sPort;}
				~Server() {if (this -> _bWsaInit) WSACleanup();}

				void enableConnectionLog() {this -> _bConnectionLog = true;}
				void run();
		};
	}
#endif