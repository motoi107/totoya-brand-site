# TOTOYA — Brand Site (structure skeleton)

MENSHO型の構成（動画ヒーロー＋ティザー＋下層ページ＋SNSフッター）を静的HTMLで組んだスケルトンです。
**デザイン未確定段階の“骨格”** なので、色・フォントは `assets/css/style.css` 冒頭の `:root` トークンに集約してあります。

## ページ構成
```
index.html            トップ（Vimeo背景動画＋各セクションのティザー）
about/                Concept（コンセプト）
craft/                Craft（こだわり）
menu/                 Menu
locations/            Locations（各店＋mailto＋Directions）
news/                 News（最新情報）
recruit/              Recruit（Indeedリンク＋採用メール mailto）
assets/css/style.css  デザイントークン＋全スタイル
assets/js/nav.js      モバイルメニュー＋ヘッダーのスクロール挙動
```

## まず差し替える箇所（検索すると見つかります）
1. **ヒーロー動画** … `assets/video/totoya-hero.mp4`（＋poster .jpg）を差し替えるだけ。コード編集は不要。
2. **各店の住所/営業時間/電話/メール** … `locations/index.html`（メールは `mailto:` リンク）。
3. **採用** … `recruit/index.html` のIndeed求人URLと `careers@…` メール。
4. **SNSリンク** … 各ページ footer の Instagram / TikTok / Facebook の `href`。
5. **本文コピー** … 各ページの `<!-- ▼差し替え -->` 箇所。
6. **メニュー** … `menu/index.html`（品名・価格・PDFリンク）。

## デプロイ（GitHub Pages）
1. このフォルダの中身をリポジトリ直下に置いて push。
2. Settings → Pages → Source を「Deploy from a branch: main / root」に。
3. 独自ドメインは Settings → Pages → Custom domain で設定（DNSは前回の手順どおり）。

> パスはルート相対（`/assets/...`, `/about/`）です。**独自ドメイン運用が前提**。
> `username.github.io/リポジトリ名/` のサブパスで開くとCSSパスがずれます。
> ローカル確認は `python3 -m http.server` をこのフォルダ直下で実行し `http://localhost:8000` で。

## デザイン確定後
`:root` の色トークン（--ink / --paper / --sea ほか）と `--font-display` / `--font-body` を差し替えれば全ページに反映されます。
