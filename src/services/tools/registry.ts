import type { TaskPlan, ToolKind } from './schema';

export type ToolPreset = { id: string; title: string; tool: ToolKind; detect: () => boolean; buildPlan: () => TaskPlan };

export const PRESETS: ToolPreset[] = [
  { id:'node:test', title:'Run Tests (Node)', tool:'test',
    detect:()=> fileExists('package.json'),
    buildPlan:()=> plan('test','npm',['run','test'], { artifacts:[{pattern:'**/junit*.xml',label:'junit'}] }) },
  { id:'node:lint', title:'Lint (ESLint)', tool:'lint',
    detect:()=> fileExists('.eslintrc') || fileExists('.eslintrc.js') || hasDep('eslint'),
    buildPlan:()=> plan('lint','npx',['eslint','.','--max-warnings=0']) },
  { id:'node:format', title:'Format (Prettier)', tool:'format',
    detect:()=> hasDep('prettier'),
    buildPlan:()=> plan('format','npx',['prettier','--write','.']) },
  { id:'node:build', title:'Build (Vite/TS)', tool:'build',
    detect:()=> hasDep('vite') || hasDep('tsup') || hasDep('typescript'),
    buildPlan:()=> plan('build', hasDep('vite')?'npx':'npx',
      hasDep('vite')?['vite','build']: hasDep('tsup')?['tsup']:['tsc','-p','.']) },

  { id:'py:test', title:'Run Tests (pytest)', tool:'test',
    detect:()=> fileExists('pyproject.toml') || hasPy(),
    buildPlan:()=> plan('test','pytest',['-q','--maxfail=1','--disable-warnings','--durations=10'],
      { artifacts:[{pattern:'**/junit*.xml',label:'junit'}] }) },
  { id:'py:lint', title:'Lint (ruff)', tool:'lint',
    detect:()=> hasPy(),
    buildPlan:()=> plan('lint','ruff',['check','.']) },
  { id:'py:format', title:'Format (black)', tool:'format',
    detect:()=> hasPy(),
    buildPlan:()=> plan('format','black',['.']) },

  { id:'go:test', title:'Run Tests (go)', tool:'test', detect:()=> hasGo(), buildPlan:()=> plan('test','go',['test','./...','-v']) },
  { id:'go:lint', title:'Lint (golangci)', tool:'lint', detect:()=> hasGo(), buildPlan:()=> plan('lint','golangci-lint',['run']) },

  { id:'rust:test', title:'Run Tests (cargo)', tool:'test', detect:()=> hasCargo(), buildPlan:()=> plan('test','cargo',['test','--all','--color','never']) },
  { id:'rust:fmt', title:'Format (rustfmt)', tool:'format', detect:()=> hasCargo(), buildPlan:()=> plan('format','cargo',['fmt']) },

  { id:'java:test', title:'Run Tests (Gradle/Maven)', tool:'test', detect:()=> fileExists('build.gradle')||fileExists('pom.xml'),
    buildPlan:()=> fileExists('build.gradle') ? plan('test','./gradlew',['test']) : plan('test','mvn',['-q','-DskipITs','test']) },

  { id:'dotnet:test', title:'Run Tests (dotnet)', tool:'test', detect:()=> hasDotnet(), buildPlan:()=> plan('test','dotnet',['test','--nologo']) },

  { id:'cpp:build', title:'Build (CMake)', tool:'build', detect:()=> fileExists('CMakeLists.txt'), buildPlan:()=> plan('build','cmake',['--build','.']) },

  { id:'swift:test', title:'Run Tests (SwiftPM)', tool:'test', detect:()=> hasSwift(), buildPlan:()=> plan('test','swift',['test']) },

  { id:'kotlin:test', title:'Run Tests (Gradle)', tool:'test', detect:()=> fileExists('build.gradle.kts'), buildPlan:()=> plan('test','./gradlew',['test']) },
  { id:'scala:test', title:'Run Tests (sbt)', tool:'test', detect:()=> hasSbt(), buildPlan:()=> plan('test','sbt',['test']) },

  { id:'php:test', title:'Run Tests (PHPUnit)', tool:'test', detect:()=> hasPhp(), buildPlan:()=> plan('test','vendor/bin/phpunit',[]) },
  { id:'ruby:test', title:'Run Tests (RSpec)', tool:'test', detect:()=> hasRuby(), buildPlan:()=> plan('test','bundle',['exec','rspec']) },

  { id:'node:audit', title:'Security Scan (npm audit)', tool:'securityScan', detect:()=> fileExists('package.json'), buildPlan:()=> plan('securityScan','npm',['audit','--audit-level=high']) },
  { id:'py:audit', title:'Security Scan (pip-audit)', tool:'securityScan', detect:()=> hasPy(), buildPlan:()=> plan('securityScan','pip-audit',[]) },
  { id:'dep:graph', title:'Dependency Graph', tool:'depGraph', detect:()=> true, buildPlan:()=> plan('depGraph','npx',['depcruise','.','--output-type','dot']) },
];

function plan(tool: ToolKind, command: string, args: string[], extras?: { artifacts?: { pattern: string; label: string }[] }): TaskPlan {
  const base: any = {
    id: crypto.randomUUID(),
    title: `${tool.toUpperCase()} • ${command} ${args.join(' ')}`.trim(),
    createdAt: Date.now(),
    tool, command, args,
    timeoutMs: 10 * 60 * 1000,
    allowNetwork: false,
    env: {},
  };
  if (extras?.artifacts) base.produceArtifacts = extras.artifacts;
  return base as TaskPlan;
}


declare function fileExists(path: string): boolean;
declare function hasDep(name: string): boolean;
declare function hasPy(): boolean; declare function hasGo(): boolean; declare function hasCargo(): boolean;
declare function hasDotnet(): boolean; declare function hasSwift(): boolean; declare function hasSbt(): boolean;
declare function hasPhp(): boolean; declare function hasRuby(): boolean;
