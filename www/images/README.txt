IMAGENS DE CAPAS
=================

As capas dos discos sao guardadas na coluna `musica_capa` da tabela `musicas`.

1. Para usar uma imagem local, coloca o ficheiro dentro de `www/images/covers/`.
2. No formulario de adicionar ou editar disco, escreve o caminho publico:
   /images/covers/nome-da-capa.jpg
3. Tambem podes usar uma URL completa que termine numa imagem.
4. Se o campo ficar vazio, o site usa `album-cover-placeholder.svg`.

Para preparar uma base de dados existente, executa `db/add-album-covers.sql` uma vez.
O ficheiro `db/database-schema.sql` ja inclui a coluna para novas instalacoes.

Formatos recomendados: JPG, PNG ou WEBP. Uma imagem quadrada, por exemplo 1000x1000,
funciona melhor porque o site recorta a capa para um quadrado.
