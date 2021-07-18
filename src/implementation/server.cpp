#include "server.h"

std::string Server::_getType(std::string sPath)
{
	for (std::map<std::string, std::string>::iterator p = this -> _mimeTypes.begin(); p != this -> _mimeTypes.end(); ++p)
		if (sPath.find(p -> first) != std::string::npos)
			return p -> first;
	return this -> _mimeTypes["NULL_TYPE"];
}

std::string Server::_makeFileInfoJson(int iSlicesLen, int iSize, std::string sType)
{
	return "{\"slicesLen\": \"" + std::to_string(iSlicesLen) + "\", \"size\": \"" + std::to_string(iSize)
		+ "\", \"type\": \"" + sType + "\"}";
}

void Server::_requestHandler(Request& req, Response& res)
{
	zer::File file;

	int iModifier = zer::file::Modifier::standard;

	if (req.haveHeader("Path"))
	{
		std::string sPath = "." + zer::athm::replace(req["Path"], "?", "");
		std::string sType = this -> _getType(sPath);

		if (sType != this -> _mimeTypes["NULL_TYPE"])
		{
			std::string sLastPathPart = *(zer::athm::split(req["Path"], "/").end() - 1);

			if (sType == ".exe" || sType == ".zip")
			{
				bool bIsRequestToGetFileInfo = sLastPathPart.find(sType) != std::string::npos;

				file.open(bIsRequestToGetFileInfo ? sPath : zer::athm::replace(sPath, "/" + sLastPathPart, ""));
				file.setSliceSize(50000);

				if (bIsRequestToGetFileInfo)
				{
					res.set("Content-Type", this -> _mimeTypes[".json"]);
					res.set("Content", this -> _makeFileInfoJson(file.slicesLen(), file.len(), this -> _mimeTypes[sType]));
				}
				else
				{
					if (zer::athm::isNumber(sLastPathPart))
					{
						file.slice(stoi(sLastPathPart), {zer::file::Modifier::binary});

						res.set("Content-Type", this -> _mimeTypes[sType]);
						res.set("Content", file.data());
					}
				}
				return;
			}
			
			file.open(sPath);
			if (file.doesExists())
			{
				res.set("Content-Type", this -> _mimeTypes[sType]);

				if (sType == ".png" || sType ==  ".pdf")
					iModifier = zer::file::Modifier::binary;
				
				if (sType == ".pdf")
					res.set("Content-Disposition", "attachment; filename=" + sLastPathPart);
			}
			else
			{
				res.set("Status-Code", "404");
				res.set("Status-Word", "Not Found");

				file.open(mSTATIC_PATH + "/404.html");
			}
		}
		else
			file.open(mSTATIC_PATH + "/main.html");
	}
	else
	{
		res.set("Status-Code", "404");
		res.set("Status-Word", "Not Found");

		file.open(mSTATIC_PATH + "/404.html");
	}

	file.read({iModifier});

	res.set("Content", file.data());
}

void Server::run()
{
	this -> _bWsaInit = !WSAStartup(MAKEWORD(2, 2), &this -> _wsaData);
	if (this -> _bWsaInit)
	{
		this -> _initListenSocket();

		SOCKET socketClient;

		fd_set mainSet;
		fd_set readSet;
		
		struct timeval delay{0, 0};

		int iReadySockets = 0;
		int iRequestBufferLength = 100000;

		char cRequestBuffer[iRequestBufferLength];

		FD_ZERO(&mainSet);
		FD_SET(this -> _socketListen, &mainSet);

		mServerLog("[info]: Server started on port " << this -> _sPort << "..");

		while (this -> _bServerWorking)
		{
			FD_ZERO(&readSet);
			for( int i = 0; i < mainSet.fd_count; ++i ) 
				FD_SET(mainSet.fd_array[i], &readSet);

			if ((iReadySockets = select(0, &readSet, NULL, NULL, &delay)) == SOCKET_ERROR)
				this -> _forceExit("[error]: select(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));

			if (iReadySockets)
			{
				for( int i = 0; i < mainSet.fd_count; ++i ) 
				{
					if (FD_ISSET(mainSet.fd_array[i], &readSet))
					{
						bool closeConnection = false;
						if (mainSet.fd_array[i] == this -> _socketListen)
						{
							socketClient = accept(this -> _socketListen, NULL, NULL);
							if (socketClient == INVALID_SOCKET)
								if (errno != EWOULDBLOCK)
									this -> _forceExit("[error]: accept(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));

							unsigned long ul = 1;
							if (ioctlsocket(socketClient, FIONBIO, &ul) == SOCKET_ERROR)
								this -> _forceExit("[error]: failed to put the socket into non-blocking mode..");

							this -> _doIfDebugModeEnable([socketClient]{
								mServerLog("[info]: client \"" << socketClient << "\" connected..");
							});						
							FD_SET(socketClient, &mainSet);
						}
						else
						{
							int iResult = recv(mainSet.fd_array[i], cRequestBuffer, iRequestBufferLength, 0);
							if (iResult > 0)
							{
								Request req;
								req.parse(cRequestBuffer);

								Response res;

								this -> _requestHandler(req, res);
								
								std::string sResData = res.make();
								
								if (send(mainSet.fd_array[i], sResData.c_str(), sResData.size(), 0) == SOCKET_ERROR)
								{
									closeConnection = true;
									mServerLog("[error]: send(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));
								}
							}
							else if (iResult == 0)
							{
								closeConnection = true;
								this -> _doIfDebugModeEnable([socketClient]{
									mServerLog("[info]: client \"" << socketClient << "\" disconnected..");
								});
							}
							else if (iResult < 0)
							{
								if (errno != EWOULDBLOCK)
								{
									closeConnection = true;
									mServerLog("[error]: recv(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));
								}
							}
						}
						if (closeConnection)
						{
							if (shutdown(mainSet.fd_array[i], SD_SEND) == SOCKET_ERROR)
								mServerLog("[error]: shutdown(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));
							closesocket(mainSet.fd_array[i]);
							FD_CLR(mainSet.fd_array[i], &mainSet);
						}
					}
				}
			}
		}

		for( int i = 0; i < mainSet.fd_count; ++i ) 
			closesocket(mainSet.fd_array[i]);
	}
	else
		this -> _forceExit("[error]: WSAStartup(...) failed..");
}

int Server::_initListenSocket()
{
	struct addrinfo *result = NULL;
	struct addrinfo hints;

	ZeroMemory(&hints, sizeof(hints));
	hints.ai_family = AF_INET;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_protocol = IPPROTO_TCP;
	hints.ai_flags = AI_PASSIVE;

	if (getaddrinfo(NULL, this -> _sPort.c_str(), &hints, &result))
		this -> _forceExit("[error]: getaddrinfo(...) failed..");

	this -> _socketListen = socket(result -> ai_family, result -> ai_socktype, result -> ai_protocol);
	if (this -> _socketListen == INVALID_SOCKET)
	{
		freeaddrinfo(result);
		this -> _forceExit("[error]: socket(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));
	}

	if (bind(this -> _socketListen, result -> ai_addr, static_cast<int>(result -> ai_addrlen)) == SOCKET_ERROR)
	{
		freeaddrinfo(result);
		closesocket(this -> _socketListen);
		this -> _forceExit("[error]: bind(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));
	}

	freeaddrinfo(result);

	if (listen(this -> _socketListen, SOMAXCONN) == SOCKET_ERROR)
	{
		closesocket(this -> _socketListen);
		this -> _forceExit("[error]: listen(...) failed.. [code]: " + std::to_string((int)WSAGetLastError()));
	}
}

void Server::_forceExit(std::string sError)
{
	mServerLog(sError);
	this -> _bServerWorking = false;
	system("pause > nul");
	exit(1);
}