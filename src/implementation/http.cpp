#include "http.h"

Response::Response()
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

std::string Response::make()
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

void Request::parse(std::string sData)
{
	std::vector<std::string> lines = zer::athm::split(sData, "\n");

	if (lines.size())
	{
		std::vector<std::string> rStatusLine = zer::athm::split(lines[0], " ");

		this -> bStandardRequest = (rStatusLine.size() == 3);

		if (this -> bStandardRequest)
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