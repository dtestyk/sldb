#include <stdio.h>
#include <winapi\windows.h>
#include <winapi\winsock2.h>

const int MAXLINE = 1024;
const int PORT = 23;
const char* IP_ADDR = "127.0.0.1";

SOCKET connect_socket(const char* pc_ip_addr, int i_port)
{
	WSADATA wsaData;
	WSAStartup(MAKEWORD(2, 2), &wsaData);
	SOCKET s = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
	
	struct sockaddr_in addr; 
	addr.sin_family = AF_INET;
	addr.sin_addr.s_addr = inet_addr(pc_ip_addr);
	addr.sin_port = htons(i_port);

	int iResult = connect(s, (SOCKADDR*)&addr, sizeof(addr));
	if (iResult == SOCKET_ERROR) {
			wprintf(L"connect function failed with error: %ld\n", WSAGetLastError());
			return INVALID_SOCKET;
	}

	wprintf(L"Connected to server.\n");
	return s;
}

int send_socket(SOCKET sock, const char* buf, int n)
{
	int iResult = send(sock, buf, n, 0);
	if (iResult == SOCKET_ERROR) {
		wprintf(L"send failed with error: %d\n", WSAGetLastError());
		return 1;
	}
	//printf("Bytes Sent: %d\n", iResult);
	return 0;
}

int close_socket(SOCKET sock)
{
	int iResult = closesocket(sock);
	if( iResult == SOCKET_ERROR ){
			wprintf(L"closesocket function failed with error: %ld\n", WSAGetLastError());
			WSACleanup();
			return 1;
	}
	WSACleanup();
	return 0;
}

int read_line(SOCKET socket, char* buf, int n_buf_size)
{
	int i = 0;
	char ch;
	int iResult = 0;
	do {
		iResult = recv(socket, &ch, 1, 0);
		BOOL is_last_buffer_char = i+1 == n_buf_size;
		if( is_last_buffer_char ){
			break;
		}
		if ( iResult > 0 ){
			if( ch == '\r' ){
				continue;
			}else if( ch == '\n' ){
				break;
			}else{
				buf[i++] = ch;
			}
		}
		else if ( iResult == 0 )
			wprintf(L"Connection closed\n");
		else
			wprintf(L"recv failed with error: %d\n", WSAGetLastError());
	} while( iResult > 0 );
	buf[i] = 0;
	return i;
}

int main(int argc, char **argv) 
{
		SOCKET sock = connect_socket(IP_ADDR, PORT);
		BOOL must_continue = sock != INVALID_SOCKET;
		
		char buf[MAXLINE];
		char* prompt = "sldb> ";
		while( must_continue ){
			//snprintf(buf, MAXLINE, "?1 ? ?\r\n");
			
			write(STDOUT_FILENO, prompt, strlen(prompt));
      int n_readed = read(STDIN_FILENO, buf, MAXLINE);
			must_continue &= !send_socket(sock, buf, n_readed);
			
			while( must_continue ){
				int len = read_line(sock, buf, MAXLINE);
				BOOL is_empty_line = len == 0;
				if( is_empty_line ){
					break;
				}
				write(STDOUT_FILENO, buf, len);
				printf("\r\n");
				BOOL must_close = !strcmp(buf, "!close");
				must_continue &= !must_close;
			}
		}
		
		int iResult = close_socket(sock);
    return iResult;
}
