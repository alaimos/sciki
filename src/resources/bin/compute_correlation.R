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

raw.corr <- function (x, y) {
  xm <- mean(x)
  ym <- mean(y)
  x  <- x - xm
  y  <- y - ym
  sp <- sqrt(sum(x ^ 2)) * sqrt(sum(y ^ 2))
  a <- sum(x * y)
  return ((a / sp))
}

input.table <- read.table(opt$input, header = TRUE, sep = "\t", row.names = 1, check.names = FALSE)
input.table <- input.table[,!apply(input.table, 2, function (x) (all(x == 0)))]

first.simulation  <- as.numeric(input.table[1,])
other.simulations <- input.table[-1,]

if (opt$correlation == "spearman") {
  result <- apply(other.simulations, 1, function (y) (cor(first.simulation, y, method = "spearman")))
} else {
  result <- apply(other.simulations, 1, function (y) (raw.corr(first.simulation, y)))
}

df.output <- data.frame(simulation=names(result), correlation=unname(result))
write.table(df.output, file = opt$output, append = FALSE, quote = FALSE, sep = "\t", col.names = TRUE, row.names = FALSE)

