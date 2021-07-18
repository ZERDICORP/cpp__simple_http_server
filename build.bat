@echo off

g++ ./src/implementation/*.cpp -o ./build/main.exe -O3 -O2 -O1 -lws2_32 -I"./src/headers"

echo Press any button..
pause > nul