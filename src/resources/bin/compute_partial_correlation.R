#!/usr/bin/env Rscript
suppressWarnings({
  if (!require("optparse", quietly = TRUE)) install.packages("optparse", dependencies = TRUE)
})
suppressPackageStartupMessages({
  library(optparse)
})

option_list <- list(
  make_option(c("-i", "--input"), type="character", default=NULL, help="input file", metavar="character"),
  make_option(c("-c", "--correlation"), type="character", default="pearson", help="correlation function", metavar="character"),
  make_option(c("-o", "--output"), type="character", default=NULL, help="output file", metavar="character")
);

opt_parser <- OptionParser(option_list=option_list)
opt <- parse_args(opt_parser)

if (opt$help) {
  print_help(opt_parser)
}

if (is.null(opt$input) || !file.exists(opt$input)) {
  print_help(opt_parser)
  stop("Input file is required!", call.=FALSE)
}

if (is.null(opt$output)) {
  print_help(opt_parser)
  stop("Output file is required!", call.=FALSE)
}

partial.corr <- function (x, y, ssq) {
  a <- sum(x * y)
  return ((a / ssq))
}

input.table <- read.table(opt$input, header = TRUE, sep = "\t", row.names = 1, check.names = FALSE)
input.table <- input.table[,!apply(input.table, 2, function (x) (all(x == 0)))]
x <- as.numeric(input.table[1,])
y <- as.numeric(input.table[2,])
tmp <- strsplit(colnames(input.table), ";", fixed = TRUE)
pathways <- sapply(tmp, function(x)(x[1]))

if (opt$correlation == "spearman") {
  result <- tapply(1:length(x), pathways, function(i) (cor(x[i], y[i], method = "spearman")))
} else {
  x   <- x - mean(x)
  y   <- y - mean(y)
  ssq <- sqrt(sum(x ^ 2)) * sqrt(sum(y ^ 2))
  result <- tapply(1:length(x), pathways, function(i) (partial.corr(x[i], y[i], ssq)))
}
result[is.na(result)] <- 0

df.output <- data.frame(pathway=names(result), correlation=unname(result))
write.table(df.output, file = opt$output, append = FALSE, quote = FALSE, sep = "\t", col.names = TRUE, row.names = FALSE)

