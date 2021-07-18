#undef UNICODE

#define WIN32_LEAN_AND_MEAN
#define FD_SETSIZE 1024

#include <ws2tcpip.h>
#include <errno.h>
#include <iostream>
#include <map>
#include <vector>
#include <locale.h>
#include <file.h>
#include <athm.h>
#include "http.h"

#pragma comment (lib, "ws2_32.lib")