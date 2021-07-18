#include <iostream>
#include <map>
#include <vector>
#include <athm.h>

#ifndef ZER__HTTP_MODEL
	#define ZER__HTTP_MODEL
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

				bool bStandardRequest;

			public:
				bool isStandardRequest() {return this -> bStandardRequest;}
				bool haveHeader(std::string sHeader) {return this -> _data.find(sHeader) != this -> _data.end();}
				
				std::string const& operator [](std::string sKey) {return this -> _data[sKey];}

				void parse(std::string sData);
		};
#endif