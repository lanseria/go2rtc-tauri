#!/bin/bash

VERSION_FILE=".version"
PACKAGE_JSON="package.json"
TAURI_CONF="src-tauri/tauri.conf.json"
CARGO_TOML="src-tauri/Cargo.toml"

# 检查参数是否合法
if [[ $# -ne 1 ]]; then
  echo "使用方法：./tag-publish.sh [major|minor|patch|<version_number>]"
  exit 1
fi

# 读取当前版本号
current_version=$(cat "$VERSION_FILE")

# 解析当前版本号的 major、minor、patch
IFS='.' read -ra version_parts <<< "$current_version"
major="${version_parts[0]}"
minor="${version_parts[1]}"
patch="${version_parts[2]}"

# 根据参数更新版本号
if [[ $1 == "major" ]]; then
  major=$((major + 1))
  minor=0
  patch=0
elif [[ $1 == "minor" ]]; then
  minor=$((minor + 1))
  patch=0
elif [[ $1 == "patch" ]]; then
  patch=$((patch + 1))
else
  new_version=$1
  echo "使用自定义版本号：$new_version"
fi

# 构造新版本号
if [[ -z $new_version ]]; then
  new_version="$major.$minor.$patch"
fi

# 验证版本号格式
if ! [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "错误：版本号格式无效，必须为 X.Y.Z"
  exit 1
fi

# 更新版本号文件
echo "$new_version" > "$VERSION_FILE"

# 更新 package.json
if [[ -f $PACKAGE_JSON ]]; then
  jq ".version = \"$new_version\"" "$PACKAGE_JSON" > tmpfile && mv tmpfile "$PACKAGE_JSON"
  echo "更新 $PACKAGE_JSON 版本号为 $new_version"
else
  echo "警告：$PACKAGE_JSON 不存在，跳过"
fi

# 更新 tauri.conf.json
if [[ -f $TAURI_CONF ]]; then
  jq ".version = \"$new_version\"" "$TAURI_CONF" > tmpfile && mv tmpfile "$TAURI_CONF"
  echo "更新 $TAURI_CONF 版本号为 $new_version"
else
  echo "警告：$TAURI_CONF 不存在，跳过"
fi

# 更新 Cargo.toml
if [[ -f $CARGO_TOML ]]; then
  sed -i.bak "s/^version = \".*\"$/version = \"$new_version\"/" "$CARGO_TOML" && rm -f "$CARGO_TOML.bak"
  echo "更新 $CARGO_TOML 版本号为 $new_version"
else
  echo "警告：$CARGO_TOML 不存在，跳过"
fi

# 收集要提交的文件
files_to_add=("$VERSION_FILE")
[[ -f $PACKAGE_JSON ]] && files_to_add+=("$PACKAGE_JSON")
[[ -f $TAURI_CONF ]] && files_to_add+=("$TAURI_CONF")
[[ -f $CARGO_TOML ]] && files_to_add+=("$CARGO_TOML")

# 提交变更
git add "${files_to_add[@]}"
git commit -m "chore(release): bump version to v$new_version"

# 创建 git tag
git tag -a "v$new_version" -m "Release v$new_version"

echo "版本更新完成！新版本：$new_version"
echo "请使用 'git push --tags' 推送标签"