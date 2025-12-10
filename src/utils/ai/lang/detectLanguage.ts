

import type { LangKey } from './languageMap';

export function detectLangFromCode(code: string): LangKey | null {
  const src = code || '';
  if (/<!DOCTYPE html>|<html[\s>]/i.test(src)) return 'html';
  if (/^[\s\S]*\{[\s\S]*:[^;]+;/.test(src) && /\b[a-z-]+:\s*[^;]+;/.test(src)) return 'css';
  if (/^\s*#!.*python|\bdef\b|\bimport\s+sys\b|print\(/.test(src)) return 'python';
  if (/\bexport\b|\bimport\b|=>|const |let |var /.test(src)) {
    if (/:\s*(string|number|boolean|any|unknown|Record|Array|Promise)/.test(src)) return 'typescript';
    return 'javascript';
  }
  if (/^\s*package\s+main|\bfunc\s+main\s*\(/.test(src)) return 'go';
  if (/\bfn\s+main\s*\(\)\s*\{/.test(src) && /\buse\s+/.test(src)) return 'rust';
  if (/\bclass\s+[A-Z]/.test(src) && /System\.out\.println/.test(src)) return 'java';
  if (/\busing\s+System;|Console\.WriteLine/.test(src)) return 'csharp';
  if (/^\s*SELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b/.test(src)) return 'sql';
  if (/^\s*\{[\s\S]*\}|^\s*\[[\s\S]*\]/.test(src.trim()) && /"[\w-]+"\s*:/.test(src)) return 'json';
  if (/^\s*---[\s\S]*?:/.test(src)) return 'yaml';
  if (/^\s*\[\w+\]\s*=/.test(src)) return 'toml';
  if (/^<template>|<script\b.*?>|<style\b.*?>/i.test(src)) return 'vue';
  if (/^<script lang="ts">|\b<svelte:/.test(src)) return 'svelte';
  if (/^\s*#!\//.test(src)) return 'bash';
  return null;
}
