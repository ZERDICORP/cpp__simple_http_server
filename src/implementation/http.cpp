#include "http.h"

HTTP::Response::Response()
{
	/*
		Setting default headers.
	*/
	this -> _data["Protocol"] = "HTTP/1.1";
	this -> _data["Status-Code"] = "200";
	this -> _data["Status-Word"] = "OK";
	this -> _data["Date"] = zer::athm::getCurrentDateTime();
	this -> _data["Connection"] = "close";
	this -> _data["Server"] = "Windows " + zer::athm::getWinVersion();
	this -> _data["Content-Type"] = "text/html";
	this -> _data["Content-Disposition"] = "inline";
	this -> _data["Content-Length"] = "0";
	this -> _data["Content"] = "";
}

std::string HTTP::Response::make()
{
	std::string sResData;

	sResData += this -> _data["Protocol"] + " " + this -> _data["Status-Code"] + " " + this -> _data["Status-Word"] + "\r\n";
	sResData += "Date: " + this -> _data["Date"] + "\r\n";
	sResData += "Connection: " + this -> _data["Connection"] + "\r\n";
	sResData += "Server: " + this -> _data["Server"] + "\r\n";
	sResData += "Content-Type: " + this -> _data["Content-Type"] + "\r\n";
	sResData += "Content-Disposition: " + this -> _data["Content-Disposition"] + "\r\n";
	sResData += "Content-Length: " + std::to_string(this -> _data["Content"].size()) + "\r\n";
	sResData += "\r\n";
	sResData += this -> _data["Content"];

	return sResData;
}

void HTTP::Request::parse(std::string sData)
{
	std::vector<std::string> lines = zer::athm::split(sData, "\n");

	if (lines.size())
	{
		std::vector<std::string> rStatusLine = zer::athm::split(lines[0], " ");

		if (rStatusLine.size() == 3)
		{
			this -> _data["Mehtod"] = rStatusLine[0];
			this -> _data["Path"] = rStatusLine[1];
			this -> _data["Protocol"] = rStatusLine[2];

			int i = 1;
			for (;; ++i)
			{
				if (lines[i].find(": ") != std::string::npos)
				{
					std::vector<std::string> rHeader = zer::athm::split(lines[i], ": ");
					this -> _data[rHeader[0]] = rHeader[1];
				}
				else
					break;
			}

			if (this -> _data.find("Content-Length") != _data.end() && std::stoi(this -> _data["Content-Length"]) > 0)
			{
				std::string sContent;

				for (int j = i + 1; j < lines.size(); ++j)
					sContent += lines[j] + "\n";
				
				this -> _data["Content"] = sContent;
			}
		}
	}
}

std::string HTTP::Server::_getType(std::string sPath)
{
	for (std::map<std::string, std::string>::iterator p = this -> _mimeTypes.begin(); p != this -> _mimeTypes.end(); ++p)
		if (sPath.find(p -> first) != std::string::npos)
			return p -> first;
	return this -> _mimeTypes["NULL_TYPE"];
}

std::string HTTP::Server::_makeFileInfoJson(int iSlicesLen, int iSize, std::string sType)
{
	return "{\"slicesLen\": \"" + std::to_string(iSlicesLen) + "\", \"size\": \"" + std::to_string(iSize)
		+ "\", \"type\": \"" + sType + "\"}";
}

void HTTP::Server::run()
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

							if (this -> _bConnectionLog)
								mServerLog("[info]: client \"" << socketClient << "\" connected..");

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

								if (this -> _bConnectionLog)
									mServerLog("[info]: client \"" << socketClient << "\" disconnected..");
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

int HTTP::Server::_initListenSocket()
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

void HTTP::Server::_forceExit(std::string sError)
{
	mServerLog(sError);
	this -> _bServerWorking = false;
	system("pause > nul");
	exit(1);
}