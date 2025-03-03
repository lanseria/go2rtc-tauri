interface ReplacementRule {
  old_text: string
  new_text: string
  options: {
    case_sensitive: boolean
    whole_word: boolean
    preserve_format: boolean
  }
}

interface WrClConfig {
  replacements: {
    pattern_type: 'plain' | 'regex'
    rules: ReplacementRule[]
  }
  file_settings: {
    input_path: string
    output_path: string
  }
  advanced: {
    max_workers: number
    timeout: number
  }
}
