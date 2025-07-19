const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.get('/baixar', (req, res) => {
  const { url, formato } = req.query;

  if (!url || !formato || !['mp4', 'mp3'].includes(formato)) {
    return res.status(400).json({ erro: 'Parâmetros inválidos. Use url e formato=mp4|mp3' });
  }

  const timestamp = Date.now();
  const nomeArquivo = `video_${timestamp}.${formato}`;
  const pastaDownload = path.join(process.cwd(), 'downloads');
  if (!fs.existsSync(pastaDownload)) fs.mkdirSync(pastaDownload);

  const caminhoCompleto = path.join(pastaDownload, nomeArquivo);

  // Monta o comando yt-dlp
  let comando = '';
  if (formato === 'mp3') {
    comando = `yt-dlp -x --audio-format mp3 -o "${caminhoCompleto}" "${url}"`;
  } else {
    comando = `yt-dlp -f mp4 -o "${caminhoCompleto}" "${url}"`;
  }

  exec(comando, (erro, stdout, stderr) => {
    if (erro) {
      console.error('Erro yt-dlp:', stderr || erro);
      return res.status(500).json({ erro: 'Erro ao baixar/converter o vídeo.' });
    }

    res.download(caminhoCompleto, nomeArquivo, (err) => {
      if (err) {
        console.error('Erro no download:', err);
      }
      // Apaga o arquivo após o download
      try {
        fs.unlinkSync(caminhoCompleto);
      } catch (e) {
        console.error('Erro ao apagar arquivo:', e);
      }
    });
  });
});

app.listen(3003, () => {
  console.log(`API rodando em http://localhost:${3003}/baixar?url=...&formato=mp4`);
});
