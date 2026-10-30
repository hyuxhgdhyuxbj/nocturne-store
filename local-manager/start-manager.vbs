Option Explicit

Dim fso, shell, appDir, serverFile, logFile, nodeExe, comspec, commandLine, browserUrl, q
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

appDir = fso.GetParentFolderName(WScript.ScriptFullName)
serverFile = appDir & "\server.js"
logFile = appDir & "\manager-data\manager-start.log"
browserUrl = "http://127.0.0.1:4310/"
q = Chr(34)

If Not fso.FileExists(serverFile) Then
  MsgBox "Cannot find server.js in the local-manager folder.", 16, "NOCTURNE startup failed"
  WScript.Quit 1
End If

nodeExe = FindNode(shell, fso)
If nodeExe = "" Then
  MsgBox "Node.js was not found on this computer.", 16, "NOCTURNE startup failed"
  WScript.Quit 1
End If

If Not IsHealthy(browserUrl) Then
  comspec = shell.ExpandEnvironmentStrings("%ComSpec%")
  commandLine = q & comspec & q & " /d /c " & q & q & nodeExe & q & " server.js > " & q & logFile & q & " 2>&1" & q
  shell.CurrentDirectory = appDir
  shell.Run commandLine, 0, False
  If Not WaitForHealth(browserUrl, 10) Then
    MsgBox "The local manager could not start. Check manager-data\manager-start.log.", 16, "NOCTURNE startup failed"
    WScript.Quit 1
  End If
End If

If shell.Environment("PROCESS")("NOCTURNE_TEST") <> "1" Then shell.Run browserUrl, 1, False
WScript.Quit 0

Function FindNode(sh, fs)
  Dim candidates, candidate, pathParts, part
  candidates = Array( _
    sh.ExpandEnvironmentStrings("%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"), _
    sh.ExpandEnvironmentStrings("%ProgramFiles%\nodejs\node.exe"), _
    sh.ExpandEnvironmentStrings("%LOCALAPPDATA%\Programs\nodejs\node.exe"), _
    sh.ExpandEnvironmentStrings("%APPDATA%\npm\node.exe") _
  )
  For Each candidate In candidates
    If fs.FileExists(candidate) Then FindNode = candidate: Exit Function
  Next
  pathParts = Split(sh.ExpandEnvironmentStrings("%PATH%"), ";")
  For Each part In pathParts
    If Len(Trim(part)) > 0 Then
      candidate = fs.BuildPath(part, "node.exe")
      If fs.FileExists(candidate) Then FindNode = candidate: Exit Function
    End If
  Next
  FindNode = ""
End Function

Function IsHealthy(url)
  Dim xhr
  On Error Resume Next
  Set xhr = CreateObject("MSXML2.XMLHTTP")
  xhr.Open "GET", url & "api/health", False
  xhr.Send
  IsHealthy = (Err.Number = 0 And xhr.Status = 200)
  Err.Clear
  On Error GoTo 0
End Function

Function WaitForHealth(url, seconds)
  Dim i
  For i = 1 To seconds * 2
    WScript.Sleep 500
    If IsHealthy(url) Then WaitForHealth = True: Exit Function
  Next
  WaitForHealth = False
End Function
