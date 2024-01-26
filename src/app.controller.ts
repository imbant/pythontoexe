import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { exec, spawn } from 'child_process';
import { Response } from 'express';
import * as path from 'path';
import { writeFileSync } from 'fs';

@Controller()
export class AppController {
  outputPath = `D:\\code\\private\\pythontoexe_nest\\temp\\output`;

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  async getExe(sourceCode: string = '') {
    return new Promise((res, rej) => {
      const input = `D:\\code\\private\\pythontoexe_nest\\temp\\helloworld.py`;

      sourceCode += `\n\ninput("Press Enter to continue...")`;

      writeFileSync(input, sourceCode);

      const args: string[] = [
        '--onefile',
        input,
        '--distpath',
        this.outputPath,
      ];

      const installerProcess = spawn(`pyinstaller `, args, { shell: true });

      installerProcess.stdout.setEncoding('utf8');
      installerProcess.stdout.on('data', (data) => {
        console.log('stdout' + data);
      });

      installerProcess.stderr.setEncoding('utf8');
      installerProcess.stderr.on('data', (data) => {
        console.log('stderr' + data);
      });

      installerProcess.on('exit', (code) => {
        console.log('close' + code);
        res(code);
      });
    });
  }

  @Post()
  async uploadSourceCode(@Body() body: any, @Res() res: Response) {
    console.log('====================new post request');

    console.log('body: ', body);

    const { sourceCode } = body;

    const fileName = 'helloworld.exe';
    const filePath = path.resolve(this.outputPath, fileName);

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    await this.getExe(sourceCode);

    res.sendFile(filePath, (e) => {
      if (e) {
        res.send('文件不存在');
      }
    });
  }
}
