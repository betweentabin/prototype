"""
PDFツール バックエンドアプリケーション

このPythonスクリプトはPDFツールのバックエンド機能を実装しています。
Flask Webフレームワークを使用して、以下の機能を提供します：

- PDF結合: 複数のPDFファイルを1つに結合
- PDF分割: PDFファイルを複数に分割
- PDF抽出: PDFから特定のページを抽出
- PDF削除: PDFから特定のページを削除

各機能はHTTP APIとして実装され、フロントエンドのJavaScriptから呼び出されます。
"""

from flask import Flask, request, send_file, render_template, jsonify, redirect
from PyPDF2 import PdfMerger, PdfReader, PdfWriter
from io import BytesIO
import zipfile
import os

# ===== アプリケーション初期化 =====

# 親ディレクトリへのパスを取得（相対パスを絶対パスに変換）
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static'))

# デバッグ出力を追加して実際のパスを確認（起動時に表示）
print(f"テンプレートディレクトリ: {template_dir}")
print(f"静的ファイルディレクトリ: {static_dir}")

# テンプレートとスタティックファイルのパスを指定してFlaskアプリを初期化
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# ===== ルート定義 =====

@app.route('/')
def index():
    """
    ルートURLへのアクセス時にPDFツールのメインページを表示
    
    Returns:
        HTML: PDFツールのメインページ
    """
    # テンプレートファイルの存在を確認（エラー処理）
    template_path = os.path.join(template_dir, 'pages', 'pdf_index.html')
    if not os.path.exists(template_path):
        return f"テンプレートファイルが見つかりません: {template_path}", 404
    return render_template('pages/pdf_index.html')

@app.route('/pdf_index')
def pdf_index():
    """
    /pdf_index URLへのアクセス時にPDFツールのメインページを表示
    
    Returns:
        HTML: PDFツールのメインページ
    """
    # テンプレートファイルの存在を確認（エラー処理）
    template_path = os.path.join(template_dir, 'pages', 'pdf_index.html')
    if not os.path.exists(template_path):
        return f"テンプレートファイルが見つかりません: {template_path}", 404
    return render_template('pages/pdf_index.html')

@app.route('/nametag-generator-top')
def nametag_generator_top():
    """
    古いURLから新しいURLへのリダイレクト（下位互換性のため）
    
    Returns:
        Redirect: PDFツールのメインページへリダイレクト
    """
    # 古いルートを新しいルートにリダイレクト
    return redirect('/pdf_index')

@app.route('/preview', methods=['POST'])
def preview_pdf():
    """
    PDFファイルのプレビュー情報（ページ数）を取得するAPI
    
    Returns:
        JSON: PDFのページ数情報
    """
    # ファイルの存在チェック
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'ファイルがアップロードされていません'}), 400
    
    # ファイル形式のチェック
    pdf_file = request.files['pdf_file']
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'PDFファイルのみアップロード可能です'}), 400
    
    # PDFファイルを読み込んでページ数を取得
    reader = PdfReader(pdf_file)
    num_pages = len(reader.pages)
    return jsonify({'num_pages': num_pages})

@app.route('/split', methods=['POST'])
def split_pdf():
    if 'pdf_file' not in request.files:
        return "ファイルがアップロードされていません", 400
    
    pdf_file = request.files['pdf_file']
    split_points = request.form.getlist('split_points[]')
    split_points = [int(point) for point in split_points]
    split_points.sort()  # 分割ポイントを昇順にソート
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return "PDFファイルのみアップロード可能です", 400
    
    reader = PdfReader(pdf_file)
    memory_file = BytesIO()
    
    with zipfile.ZipFile(memory_file, 'w') as zf:
        start_page = 0
        for i, end_page in enumerate(split_points):
            writer = PdfWriter()
            # start_pageからend_pageまでのページを追加
            for page_num in range(start_page, end_page):
                writer.add_page(reader.pages[page_num])
            
            # 分割したPDFをZIPに追加
            pdf_bytes = BytesIO()
            writer.write(pdf_bytes)
            pdf_bytes.seek(0)
            zf.writestr(f'split_{i+1}.pdf', pdf_bytes.getvalue())
            start_page = end_page
        
        # 最後の分割点から最後のページまでを処理
        if start_page < len(reader.pages):
            writer = PdfWriter()
            for page_num in range(start_page, len(reader.pages)):
                writer.add_page(reader.pages[page_num])
            
            pdf_bytes = BytesIO()
            writer.write(pdf_bytes)
            pdf_bytes.seek(0)
            zf.writestr(f'split_{len(split_points)+1}.pdf', pdf_bytes.getvalue())
    
    memory_file.seek(0)
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name='split_pdfs.zip'
    )

@app.route('/combine', methods=['POST'])
def combine_pdfs():
    # フォームデータからPDFファイルを取得
    if 'pdf_files' in request.files:
        # pdf_indexからのリクエスト（複数ファイルが一つのフィールドに）
        pdf_files = request.files.getlist('pdf_files')
    else:
        # nametag-generator-topからのリクエスト（ファイルが個別のフィールドに）
        pdf_files = []
        file_count = int(request.form.get('file_count', 0))
        for i in range(file_count):
            field_name = f'pdf_file_{i}'
            if field_name in request.files:
                pdf_files.append(request.files[field_name])
    
    if not pdf_files:
        return "PDFファイルがアップロードされていません", 400
    
    merger = PdfMerger()
    
    # PDF検証
    for file in pdf_files:
        if not file.filename.lower().endswith('.pdf'):
            return "PDFファイルのみアップロード可能", 400
        merger.append(file)
    
    output_pdf = BytesIO()
    merger.write(output_pdf)
    merger.close()
    output_pdf.seek(0)
    
    return send_file(output_pdf, 'application/pdf', as_attachment=True, download_name='combined.pdf')

@app.route('/delete', methods=['POST'])
def delete_pdf():
    if 'pdf_file' not in request.files:
        return "ファイルがアップロードされていません", 400
    
    pdf_file = request.files['pdf_file']
    delete_pages = request.form.getlist('delete_pages[]')
    delete_pages = [int(page) for page in delete_pages]
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return "PDFファイルのみアップロード可能です", 400
    
    reader = PdfReader(pdf_file)
    writer = PdfWriter()
    
    # 削除するページ以外のページを新しいPDFに追加
    for i in range(len(reader.pages)):
        if (i + 1) not in delete_pages:  # PDFのページ番号は1から始まるため、i + 1
            writer.add_page(reader.pages[i])
    
    # 修正したPDFを保存
    output_pdf = BytesIO()
    writer.write(output_pdf)
    output_pdf.seek(0)
    
    return send_file(
        output_pdf,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='modified.pdf'
    )

@app.route('/extract', methods=['POST'])
def extract_pdf():
    if 'pdf_file' not in request.files:
        return "ファイルがアップロードされていません", 400
    
    pdf_file = request.files['pdf_file']
    extract_pages = request.form.getlist('extract_pages[]')
    extract_pages = [int(page) for page in extract_pages]
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return "PDFファイルのみアップロード可能です", 400
    
    reader = PdfReader(pdf_file)
    writer = PdfWriter()
    
    # 選択したページのみを新しいPDFに追加
    for page_num in extract_pages:
        writer.add_page(reader.pages[page_num - 1])  # PDFのページ番号は0から始まるため、-1
    
    # 抽出したPDFを保存
    output_pdf = BytesIO()
    writer.write(output_pdf)
    output_pdf.seek(0)
    
    return send_file(
        output_pdf,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='extracted.pdf'
    )

if __name__ == '__main__':
    app.run(debug=True)